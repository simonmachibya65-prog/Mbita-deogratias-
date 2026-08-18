-- Add citations column to Publication table
-- Run this on Vercel database

ALTER TABLE "Publication" 
ADD COLUMN IF NOT EXISTS "citations" INTEGER DEFAULT 0;

-- Update existing records to have 0 citations
UPDATE "Publication" 
SET "citations" = 0 
WHERE "citations" IS NULL;
