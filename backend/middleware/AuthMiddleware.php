<?php

require_once __DIR__ . "/../utils/JWT.php";

class AuthMiddleware {

    private $jwt;

    public function __construct() {
        $this->jwt = new JWTHandler();
    }

    /**
     * General Verification (Any logged in user)
     */
    public function verify() {
        $token = $this->getBearerToken();

        if (!$token) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Token required"]);
            exit;
        }

        $decoded = $this->jwt->verifyToken($token);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid or expired token"]);
            exit;
        }

        return $decoded->user;
    }

    /**
     * Strict ADMIN Enforcement
     */
    public function requireAdmin() {
        $user = $this->verify();
        if ($user->role !== 'admin') {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Access Forbidden: Admins only"]);
            exit;
        }
        return $user;
    }

    /**
     * Strict PASSENGER (User) Enforcement
     */
    public function requireUser() {
        $user = $this->verify();
        if ($user->role !== 'user') {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Access Forbidden: Passengers only"]);
            exit;
        }
        return $user;
    }

    private function getBearerToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

        if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
        return null;
    }
}