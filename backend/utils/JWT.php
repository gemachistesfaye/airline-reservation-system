<?php

require_once __DIR__ . "/../config/config.php";
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHandler {

    private $secret;

    public function __construct() {
        $this->secret = JWT_SECRET;
    }

    public function createToken($user) {
        $payload = [
            "iss" => "airline-api",
            "iat" => time(),
            "exp" => time() + 3600 * 24, // 24 hours
            "user" => [
                "id" => $user["id"] ?? null,
                "first_name" => $user["first_name"] ?? null,
                "last_name" => $user["last_name"] ?? null,
                "email" => $user["email"] ?? null,
                "role" => $user["role"] ?? "user"
            ]
        ];
        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function verifyToken($token) {
        try {
            return JWT::decode($token, new Key($this->secret, 'HS256'));
        } catch (Exception $e) {
            return null;
        }
    }
}