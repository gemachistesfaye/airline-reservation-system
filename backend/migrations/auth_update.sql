USE airline_db;

ALTER TABLE passengers 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reset_token_expiry DATETIME DEFAULT NULL;

-- Ensure is_verified and verification_token exist (they should be there from previous steps but let's be sure)
ALTER TABLE passengers 
MODIFY COLUMN is_verified TINYINT(1) DEFAULT 0,
MODIFY COLUMN verification_token VARCHAR(100) DEFAULT NULL;
