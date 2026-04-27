<?php

require_once __DIR__ . "/../utils/JWT.php";
require_once __DIR__ . "/../services/EmailService.php";
require_once __DIR__ . "/../middleware/AuthMiddleware.php";

class AuthController {

    private $conn;
    private $jwt;
    private $emailService;
    private $auth;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->jwt = new JWTHandler();
        $this->emailService = new EmailService();
        $this->auth = new AuthMiddleware();
    }

    // =====================
    // REGISTER (USER ONLY)
    // =====================
    public function register() {
        $data = json_decode(file_get_contents("php://input"));

        if (!$data || empty($data->email) || empty($data->password) || empty($data->username)) {
            echo json_encode(["status" => "error", "message" => "Required fields missing"]);
            return;
        }

        // Check if exists
        $check = $this->conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $check->execute([$data->email, $data->username]);
        if ($check->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Email or Username already taken"]);
            return;
        }

        $password = password_hash($data->password, PASSWORD_BCRYPT);
        $token = bin2hex(random_bytes(32));

        $stmt = $this->conn->prepare("
            INSERT INTO users (first_name, last_name, username, email, password, role, verification_token, is_verified)
            VALUES (?, ?, ?, ?, ?, 'user', ?, 0)
        ");

        $stmt->execute([
            $data->first_name ?? '',
            $data->last_name ?? '',
            $data->username,
            $data->email,
            $password,
            $token
        ]);

        $this->emailService->sendVerificationEmail($data->email, $token, $data->first_name ?? 'User');

        echo json_encode(["status" => "success", "message" => "Registration successful! Please verify your email."]);
    }

    // =====================
    // SMART LOGIN (USER & ADMIN)
    // =====================
    public function login() {
        $data = json_decode(file_get_contents("php://input"));
        $input = $data->login_input ?? $data->email ?? null;
        $password = $data->password ?? null;

        if (!$input || !$password) {
            echo json_encode(["status" => "error", "message" => "Credentials required"]);
            return;
        }

        $field = str_contains($input, '@') ? 'email' : 'username';
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE $field = ?");
        $stmt->execute([$input]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            
            // Only block passengers if not verified. Admins skip verification check if needed.
            if ($user['role'] === 'user' && !$user['is_verified']) {
                echo json_encode(["status" => "error", "message" => "Please verify your email first"]);
                return;
            }

            unset($user['password']);
            
            $token = $this->jwt->createToken([
                "id" => $user['id'],
                "username" => $user['username'],
                "email" => $user['email'],
                "role" => $user['role']
            ]);

            echo json_encode([
                "status" => "success",
                "token" => $token,
                "user" => $user
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
        }
    }

    // =====================
    // CHANGE PASSWORD (SECURE)
    // =====================
    public function changePassword() {
        $user = $this->auth->verify(); // Requires login
        $data = json_decode(file_get_contents("php://input"));
        
        $old_pass = $data->old_password ?? null;
        $new_pass = $data->new_password ?? null;

        if (!$old_pass || !$new_pass) {
            echo json_encode(["status" => "error", "message" => "Both passwords required"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$user->id]);
        $stored = $stmt->fetchColumn();

        if (password_verify($old_pass, $stored)) {
            $hashed = password_hash($new_pass, PASSWORD_BCRYPT);
            $stmt = $this->conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$hashed, $user->id]);
            echo json_encode(["status" => "success", "message" => "Password updated!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Incorrect current password"]);
        }
    }

    // =====================
    // RESET PASSWORD
    // =====================
    public function resetPassword() {
        $data = json_decode(file_get_contents("php://input"));
        $token = isset($data->token) ? trim($data->token) : null;
        $password = $data->password ?? null;

        if (!$token || !$password) {
            echo json_encode(["status" => "error", "message" => "Token and password required"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > CURRENT_TIMESTAMP");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(["status" => "error", "message" => "Link invalid or expired"]);
            return;
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->conn->prepare("UPDATE users SET password = ?, is_verified = 1, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?");
        $stmt->execute([$hashed, $user['id']]);

        echo json_encode(["status" => "success", "message" => "Password reset! You can now log in."]);
    }

    public function verifyEmail() {
        $token = $_GET['token'] ?? null;
        if (!$token) { echo "Invalid link"; return; }

        $stmt = $this->conn->prepare("SELECT id FROM users WHERE verification_token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) { echo "Verification failed: link expired or invalid."; return; }

        $stmt = $this->conn->prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?");
        $stmt->execute([$user['id']]);

        header("Location: " . BASE_URL_FRONTEND . "/login?verified=true");
        exit;
    }

    public function getUserProfile() {
        $user = $this->auth->verify();
        $stmt = $this->conn->prepare("SELECT id, first_name, last_name, username, email, phone_number, passport_number, date_of_birth FROM users WHERE id = ?");
        $stmt->execute([$user->id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $profile]);
    }

    public function updateUserProfile() {
        $user = $this->auth->verify();
        $data = json_decode(file_get_contents("php://input"));
        
        $stmt = $this->conn->prepare("UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, passport_number = ?, date_of_birth = ? WHERE id = ?");
        $stmt->execute([
            $data->first_name ?? '',
            $data->last_name ?? '',
            $data->phone_number ?? '',
            $data->passport_number ?? '',
            $data->date_of_birth ?? null,
            $user->id
        ]);

        echo json_encode(["status" => "success", "message" => "Profile updated!"]);
    }
}