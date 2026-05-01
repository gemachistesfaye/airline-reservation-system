ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_student TINYINT(1) DEFAULT 0 AFTER user_type,
    ADD COLUMN IF NOT EXISTS student_id_file VARCHAR(255) DEFAULT NULL AFTER is_student,
    ADD COLUMN IF NOT EXISTS student_verified TINYINT(1) DEFAULT 0 AFTER student_id_file,
    ADD COLUMN IF NOT EXISTS student_verification_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none' AFTER student_verified;
