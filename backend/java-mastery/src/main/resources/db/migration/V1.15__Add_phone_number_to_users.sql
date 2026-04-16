-- V1.15__Add_phone_number_to_users.sql
-- Add phone_number column to users table

ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) UNIQUE;
