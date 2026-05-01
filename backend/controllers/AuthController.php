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

    private function sendJSON($data, $statusCode = 200) {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        ob_clean();
        echo json_encode($data);
        exit;
    }

    private function handleFileUpload($fileKey, $targetDir, $prefix) {
        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $file = $_FILES[$fileKey];
        $allowedMime = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'application/pdf' => 'pdf'];
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!isset($allowedMime[$mime])) {
            $this->sendJSON(["status" => "error", "message" => "Invalid file type for $fileKey. JPG, PNG, PDF only."], 400);
        }

        if ($file['size'] > 5 * 1024 * 1024) {
            $this->sendJSON(["status" => "error", "message" => "$fileKey exceeds 5MB limit."], 400);
        }

        $uploadPath = __DIR__ . "/../" . $targetDir;
        if (!is_dir($uploadPath)) mkdir($uploadPath, 0755, true);

        $fileName = $prefix . "_" . uniqid() . "." . $allowedMime[$mime];
        if (move_uploaded_file($file['tmp_name'], $uploadPath . "/" . $fileName)) {
            return $targetDir . "/" . $fileName;
        }

        return null;
    }

    // =====================
    // REGISTER (USER ONLY)
    // =====================
    public function register() {
        // Since we are using multipart/form-data for files, data is in $_POST
        $name = $_POST['name'] ?? null;
        $username = $_POST['username'] ?? null;
        $email = $_POST['email'] ?? null;
        $password = $_POST['password'] ?? null;
        $is_student = (isset($_POST['is_student']) && ($_POST['is_student'] === 'true' || $_POST['is_student'] === '1')) ? 1 : 0;

        if (!$name || !$email || !$password) {
            $this->sendJSON(["status" => "error", "message" => "Missing required fields (name, email, password)"], 400);
        }

        // Check unique
        $check = $this->conn->prepare("SELECT id FROM users WHERE email = ? OR (username IS NOT NULL AND username = ?)");
        $check->execute([$email, $username]);
        if ($check->rowCount() > 0) {
            $this->sendJSON(["status" => "error", "message" => "Email or Username already taken"], 400);
        }

        // Handle File Uploads
        $passportPath = $this->handleFileUpload('passport_file', 'uploads/passports', 'passport');
        if (!$passportPath) {
            $this->sendJSON(["status" => "error", "message" => "Passport upload is mandatory."], 400);
        }

        $studentIdPath = null;
        if ($is_student) {
            $studentIdPath = $this->handleFileUpload('student_id_file', 'uploads/student_ids', 'student');
            if (!$studentIdPath) {
                $this->sendJSON(["status" => "error", "message" => "Student ID is required for student registration."], 400);
            }
        }

        $hashedPass = password_hash($password, PASSWORD_BCRYPT);
        $token = bin2hex(random_bytes(32));
        $user_type = $is_student ? 'student' : 'regular';
        $v_status = $is_student ? 'pending' : 'none';

        try {
            $stmt = $this->conn->prepare("
                INSERT INTO users (name, username, email, password, role, user_type, is_student, passport_file, student_id_file, student_verification_status, verification_token, is_verified)
                VALUES (?, ?, ?, ?, 'user', ?, ?, ?, ?, ?, ?, 0)
            ");
            $stmt->execute([$name, $username, $email, $hashedPass, $user_type, $is_student, $passportPath, $studentIdPath, $v_status, $token]);

            $this->emailService->sendVerificationEmail($email, $token, $name);
            $this->sendJSON(["status" => "success", "message" => "Registration successful! Please check your email for verification link."]);
        } catch (Exception $e) {
            $this->sendJSON(["status" => "error", "message" => "Database error during registration."], 500);
        }
    }

    // =====================
    // LOGIN (USER & ADMIN)
    // =====================
    public function login() {
        $data = json_decode(file_get_contents("php://input"));
        $login_input = $data->login_input ?? $data->email ?? null;
        $password = $data->password ?? null;

        if (!$login_input || !$password) {
            $this->sendJSON(["status" => "error", "message" => "Login input (email/username) and password required"], 400);
        }

        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$login_input, $login_input]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            if (!$user['is_verified']) {
                $this->sendJSON(["status" => "error", "message" => "Please verify your email first"], 403);
            }

            unset($user['password']);
            $token = $this->jwt->createToken([
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email'],
                "role" => $user['role'],
                "user_type" => $user['user_type'],
                "is_student" => (int)($user['is_student'] ?? 0),
                "student_verified" => (int)($user['student_verified'] ?? 0)
            ]);

            $this->sendJSON(["status" => "success", "token" => $token, "user" => $user]);
        } else {
            $this->sendJSON(["status" => "error", "message" => "Invalid credentials"], 401);
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
            $this->sendJSON(["status" => "error", "message" => "Both passwords required"], 400);
        }

        $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$user->id]);
        $stored = $stmt->fetchColumn();

        if (password_verify($old_pass, $stored)) {
            $hashed = password_hash($new_pass, PASSWORD_BCRYPT);
            $stmt = $this->conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$hashed, $user->id]);
            $this->sendJSON(["status" => "success", "message" => "Password updated!"]);
        } else {
            $this->sendJSON(["status" => "error", "message" => "Incorrect current password"], 400);
        }
    }

    public function forgotPassword() {
        $data = json_decode(file_get_contents("php://input"));
        $email = $data->email ?? null;

        if (!$email) $this->sendJSON(["status" => "error", "message" => "Email is required"], 400);

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

        $this->sendJSON(["status" => "success", "message" => "If the email exists, a reset link has been sent."]);
    }

    public function resetPassword() {
        $data = json_decode(file_get_contents("php://input"));
        $token = $data->token ?? null;
        $password = $data->password ?? null;

        if (!$token || !$password) $this->sendJSON(["status" => "error", "message" => "Token and password required"], 400);

        $stmt = $this->conn->prepare("SELECT id FROM users WHERE reset_token = ? AND token_expiry > CURRENT_TIMESTAMP");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) $this->sendJSON(["status" => "error", "message" => "Link invalid or expired"], 400);

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->conn->prepare("UPDATE users SET password = ?, is_verified = 1, reset_token = NULL, token_expiry = NULL WHERE id = ?");
        $stmt->execute([$hashed, $user['id']]);

        $this->sendJSON(["status" => "success", "message" => "Password reset! You can now log in."]);
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
            SELECT id, name, username, email, role, user_type, is_student, student_id_file, passport_file, student_verified, student_verification_status, created_at
            FROM users
            WHERE id = ?
        ");
        $stmt->execute([$user->id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->sendJSON(["status" => "success", "data" => $profile]);
    }

    public function updateUserProfile() {
        $user = $this->auth->verify();
        $data = json_decode(file_get_contents("php://input"));

        if (!$data || empty($data->name)) {
             $this->sendJSON(["status" => "error", "message" => "Name is required"], 400);
        }

        $stmt = $this->conn->prepare("UPDATE users SET name = ?, username = ? WHERE id = ?");
        $stmt->execute([$data->name, $data->username ?? null, $user->id]);

        $this->sendJSON(["status" => "success", "message" => "Profile updated!"]);
    }
}