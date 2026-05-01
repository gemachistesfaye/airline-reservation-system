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

        if (!$data || empty($data->email) || empty($data->password) || empty($data->name)) {
            echo json_encode(["status" => "error", "message" => "Required fields missing (name, email, password)"]);
            return;
        }

        // Check if exists
        $check = $this->conn->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$data->email]);
        if ($check->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Email already taken"]);
            return;
        }

        $password = password_hash($data->password, PASSWORD_BCRYPT);
        $token = bin2hex(random_bytes(32));
        $user_type = ($data->user_type ?? 'regular') === 'student' ? 'student' : 'regular';
        $is_student = $user_type === 'student' ? 1 : 0;

        $stmt = $this->conn->prepare("
            INSERT INTO users (name, email, password, role, user_type, is_student, student_verified, student_verification_status, verification_token, is_verified)
            VALUES (?, ?, ?, 'user', ?, ?, 0, 'none', ?, 0)
        ");

        $stmt->execute([
            $data->name,
            $data->email,
            $password,
            $user_type,
            $is_student,
            $token
        ]);

        $this->emailService->sendVerificationEmail($data->email, $token, $data->name);

        echo json_encode(["status" => "success", "message" => "Registration successful! Please verify your email."]);
    }

    // =====================
    // LOGIN (USER & ADMIN)
    // =====================
    public function login() {
        $data = json_decode(file_get_contents("php://input"));
        $email = $data->email ?? $data->login_input ?? null;
        $password = $data->password ?? null;

        if (!$email || !$password) {
            echo json_encode(["status" => "error", "message" => "Email and password required"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            
            // Only block if not verified. 
            if (!$user['is_verified']) {
                echo json_encode(["status" => "error", "message" => "Please verify your email first"]);
                return;
            }

            unset($user['password']);
            
            $token = $this->jwt->createToken([
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email'],
                "role" => $user['role'],
                "user_type" => $user['user_type'],
                "is_student" => (int)($user['is_student'] ?? 0),
                "student_verified" => (int)($user['student_verified'] ?? 0),
                "student_verification_status" => $user['student_verification_status'] ?? 'none'
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
    // PASSWORD MANAGEMENT
    // =====================
    public function changePassword() {
        $user = $this->auth->verify(); 
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

    public function forgotPassword() {
        $data = json_decode(file_get_contents("php://input"));
        $email = $data->email ?? null;

        if (!$email) {
            echo json_encode(["status" => "error", "message" => "Email is required"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT id, name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            $token = bin2hex(random_bytes(32));
            $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $stmt = $this->conn->prepare("UPDATE users SET reset_token = ?, token_expiry = ? WHERE id = ?");
            $stmt->execute([$token, $expiry, $user['id']]);
            
            $this->emailService->sendResetEmail($email, $token, $user['name']);
        }

        // Always return success for security (prevent email harvesting)
        echo json_encode(["status" => "success", "message" => "If the email exists, a reset link has been sent."]);
    }

    public function resetPassword() {
        $data = json_decode(file_get_contents("php://input"));
        $token = isset($data->token) ? trim($data->token) : null;
        $password = $data->password ?? null;

        if (!$token || !$password) {
            echo json_encode(["status" => "error", "message" => "Token and password required"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT id FROM users WHERE reset_token = ? AND token_expiry > CURRENT_TIMESTAMP");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(["status" => "error", "message" => "Link invalid or expired"]);
            return;
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->conn->prepare("UPDATE users SET password = ?, is_verified = 1, reset_token = NULL, token_expiry = NULL WHERE id = ?");
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

    // =====================
    // PROFILE MANAGEMENT
    // =====================
    public function getUserProfile() {
        $user = $this->auth->verify();
        $stmt = $this->conn->prepare("
            SELECT id, name, email, role, user_type, is_student, student_id_file, student_verified, student_verification_status, created_at
            FROM users
            WHERE id = ?
        ");
        $stmt->execute([$user->id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $profile]);
    }

    public function updateUserProfile() {
        $user = $this->auth->verify();
        $data = json_decode(file_get_contents("php://input"));

        $user_type = ($data->user_type ?? 'regular') === 'student' ? 'student' : 'regular';
        $is_student = $user_type === 'student' ? 1 : 0;

        $stmt = $this->conn->prepare("UPDATE users SET name = ?, user_type = ?, is_student = ? WHERE id = ?");
        $stmt->execute([
            $data->name,
            $user_type,
            $is_student,
            $user->id
        ]);

        echo json_encode(["status" => "success", "message" => "Profile updated!"]);
    }

    public function uploadStudentId() {
        $user = $this->auth->requireUser();

        if (!isset($_FILES['student_id_file'])) {
            echo json_encode(["status" => "error", "message" => "student_id_file is required"]);
            return;
        }

        $file = $_FILES['student_id_file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(["status" => "error", "message" => "Upload failed"]);
            return;
        }

        $allowedMime = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'application/pdf' => 'pdf'
        ];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!isset($allowedMime[$mime])) {
            echo json_encode(["status" => "error", "message" => "Only JPG, PNG, and PDF files are allowed"]);
            return;
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            echo json_encode(["status" => "error", "message" => "File must be 5MB or smaller"]);
            return;
        }

        $uploadDir = __DIR__ . "/../uploads/student_ids";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $safeFileName = "student_" . $user->id . "_" . time() . "." . $allowedMime[$mime];
        $target = $uploadDir . "/" . $safeFileName;

        if (!move_uploaded_file($file['tmp_name'], $target)) {
            echo json_encode(["status" => "error", "message" => "Unable to save uploaded file"]);
            return;
        }

        $relativePath = "uploads/student_ids/" . $safeFileName;
        $stmt = $this->conn->prepare("
            UPDATE users
            SET user_type = 'student', is_student = 1, student_id_file = ?, student_verified = 0, student_verification_status = 'pending'
            WHERE id = ?
        ");
        $stmt->execute([$relativePath, $user->id]);

        echo json_encode([
            "status" => "success",
            "message" => "Student ID uploaded. Verification is pending admin review.",
            "data" => [
                "student_id_file" => $relativePath,
                "student_verification_status" => "pending"
            ]
        ]);
    }
}