<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/config.php';

class EmailService {
    
    private $mail;

    public function __construct() {
        $this->mail = new PHPMailer(true);
        
        $this->mail->isSMTP();
        $this->mail->Host       = SMTP_HOST;
        $this->mail->SMTPAuth   = true;
        $this->mail->Username   = SMTP_USER;
        $this->mail->Password   = SMTP_PASS;
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port       = SMTP_PORT;
        
        // --- ADDED FOR LOCAL XAMPP ROBUSTNESS ---
        $this->mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        // ----------------------------------------

        $this->mail->setFrom('no-reply@aerospace.com', 'AeroSpace Airlines');
    }

    public function sendVerificationEmail($email, $token, $name) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($email, $name);
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Verify Your AeroSpace Account';
            
            $verifyLink = BASE_URL_BACKEND . "/verify-email?token=" . $token;
            
            $this->mail->Body = "
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2 style='color: #4f46e5;'>Welcome to AeroSpace, $name!</h2>
                    <p>Thank you for registering. Please click the button below to verify your email address and activate your account.</p>
                    <a href='$verifyLink' style='display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;'>Verify Email Address</a>
                </div>
            ";

            return $this->mail->send();
        } catch (Exception $e) {
            return false;
        }
    }

    public function sendPasswordResetEmail($email, $token, $name) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($email, $name);
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Reset Your AeroSpace Password';
            
            $resetLink = BASE_URL_FRONTEND . "/reset-password?token=" . $token;
            
            $this->mail->Body = "
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2 style='color: #4f46e5;'>Password Reset Request</h2>
                    <p>Hello $name, we received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</p>
                    <a href='$resetLink' style='display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;'>Reset Password</a>
                </div>
            ";

            return $this->mail->send();
        } catch (Exception $e) {
            return false;
        }
    }
}
