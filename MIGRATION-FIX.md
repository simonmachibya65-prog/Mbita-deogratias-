# Citations Field Migration Fix

## Problem
The `citations` column was missing from the `Publication` table in production, causing sync errors:
```
Error: The column `Publication.citations` does not exist in the current database
```

## Root Cause
The previous approach used a postbuild script (`add-citations-field.mjs`) that ran **after** the Next.js build. However:
1. Vercel might have cached the build or skipped the postbuild
2. The script had `|| true` which silently ignored failures
3. No proper Prisma migration was created

## Solution
Created a **proper Prisma migration** that runs **before** the build:

### Files Changed:

1. **Created Migration**: `prisma/migrations/20260818162004_add_citations_field/migration.sql`
   ```sql
   ALTER TABLE "Publication" ADD COLUMN IF NOT EXISTS "citations" INTEGER DEFAULT 0;
   UPDATE "Publication" SET "citations" = 0 WHERE "citations" IS NULL;
   ```

2. **Updated Build Scripts** in `package.json`:
   ```json
   "build": "prisma generate && prisma migrate deploy && next build"
   "vercel-build": "prisma generate && prisma migrate deploy && next build"
   ```

### How It Works Now:

```
1. Vercel starts build
2. prisma generate      → Generates Prisma Client
3. prisma migrate deploy → Runs pending migrations (adds citations column)
4. next build           → Builds Next.js app
5. Deploy              → Everything works!
```

## Benefits

✅ **Automatic**: Runs on every Vercel deployment  
✅ **Safe**: Uses `IF NOT EXISTS` to avoid errors if column already exists  
✅ **Proper**: Standard Prisma migration approach  
✅ **Reliable**: Runs before build, not after  
✅ **Idempotent**: Can run multiple times safely  

## Testing

After Vercel deploys (2-3 minutes):

1. Go to: https://mbita-deogratias.vercel.app/admin/sync-complete
2. Click: "⚡ Sync Everything Now"
3. Should work without errors!

## Verification

Check Vercel logs for:
```
✅ prisma migrate deploy
✅ Migration complete
✅ Build succeeded
```

## Next Steps

The sync system will now work correctly and fetch from all academic accounts:
- 🎓 Google Scholar
- 🆔 ORCID  
- 🔬 ResearchGate
- 📚 Academia.edu
- 📊 Scopus

All publications will be imported with citation counts!
