-- Migration: Add image_url field to users table
ALTER TABLE users ADD COLUMN image_url VARCHAR(255);
