<?php
date_default_timezone_set('Africa/Addis_Ababa');

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'airline_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// SMTP Configuration (Gmail)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USER', 'gemachistesfaye36@gmail.com');
define('SMTP_PASS', 'svmqkvtiwahccate');
define('SMTP_PORT', 587);

// App Configuration
define('BASE_URL_BACKEND', 'http://localhost/airline-reservation-system/backend');
define('BASE_URL_FRONTEND', 'http://localhost:5176');
define('JWT_SECRET', 'airline_reservation_system_super_secret_key_2026');
