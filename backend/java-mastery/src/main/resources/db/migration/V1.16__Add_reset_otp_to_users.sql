-- Migration: Add reset OTP fields to users table
ALTER TABLE users ADD COLUMN reset_otp VARCHAR(6);
ALTER TABLE users ADD COLUMN reset_otp_expiry TIMESTAMP;
