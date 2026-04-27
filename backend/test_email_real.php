<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/config.php';

$mail = new PHPMailer(true);

try {
    // Enable verbose debug output
    $mail->SMTPDebug = 2; // 2 = client and server messages
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;

    $mail->setFrom('test@aerospace.com', 'AeroSpace Test');
    $mail->addAddress('gemachistesfaye36@gmail.com'); 

    $mail->isHTML(true);
    $mail->Subject = 'Mailtrap Diagnostic Test';
    $mail->Body    = 'If you see this, your SMTP configuration is perfect!';

    echo "Attempting to send email...\n";
    $mail->send();
    echo "\nSUCCESS: Email sent successfully to Mailtrap!\n";
} catch (Exception $e) {
    echo "\nERROR: Email could not be sent. Mailer Error: {$mail->ErrorInfo}\n";
}
