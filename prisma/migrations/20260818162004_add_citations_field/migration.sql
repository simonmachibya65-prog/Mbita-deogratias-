-- Add citations column to Publication table
ALTER TABLE "Publication" ADD COLUMN IF NOT EXISTS "citations" INTEGER DEFAULT 0;

-- Update existing records to have default citation count
UPDATE "Publication" SET "citations" = 0 WHERE "citations" IS NULL;
