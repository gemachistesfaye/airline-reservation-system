<?php

require_once __DIR__ . "/../utils/JWT.php";

class AuthMiddleware {

    private $jwt;

    public function __construct() {
        $this->jwt = new JWTHandler();
    }

    private function sendJSON($data, $statusCode = 401) {
        header('Content-Type: application/json');
        http_response_code($statusCode);
        ob_clean();
        echo json_encode($data);
        exit;
    }

    public function verify() {
        $token = $this->getBearerToken();
        if (!$token) $this->sendJSON(["status" => "error", "message" => "Token required"], 401);

        $decoded = $this->jwt->verifyToken($token);
        if (!$decoded) $this->sendJSON(["status" => "error", "message" => "Invalid or expired token"], 401);

        return $decoded->user;
    }

    public function requireAdmin() {
        $user = $this->verify();
        if ($user->role !== 'admin') $this->sendJSON(["status" => "error", "message" => "Access Forbidden: Admins only"], 403);
        return $user;
    }

    public function requireUser() {
        $user = $this->verify();
        if ($user->role !== 'user') $this->sendJSON(["status" => "error", "message" => "Access Forbidden: Passengers only"], 403);
        return $user;
    }

    private function getBearerToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) return $matches[1];
        return null;
    }
}