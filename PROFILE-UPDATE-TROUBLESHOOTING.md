# Profile Update Troubleshooting Guide

## Issue: "Failed to update profile" Error

When you try to update your profile information (name, email, department, etc.) in the admin panel, you get a "Failed" error message.

---

## Quick Fixes

### Fix 1: Run the Test Script
```bash
node test-profile-update.mjs
```

This will:
- Check database connection
- Test profile update functionality
- Identify the exact issue
- Show detailed error messages

### Fix 2: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try updating your profile
4. Look for error messages in red
5. Take a screenshot and check against common errors below

### Fix 3: Check Vercel Function Logs
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **mbita-deogratias**
3. Click on **Deployments** tab
4. Click on the latest deployment
5. Click on **Functions** tab
6. Look for errors in `/api/admin/profile` function

---

## Common Errors and Solutions

### Error 1: "Validation failed"

**Cause:** Required fields are missing or empty.

**Required Fields:**
- Full Name
- Title
- Department
- Institution
- Email (must be valid email)
- Office Location
- Office Hours
- Bio

**Solution:**
1. Make sure ALL required fields are filled
2. Check that email is in valid format (has @ and .)
3. Don't leave any required field empty

---

### Error 2: "Invalid JSON in request body"

**Cause:** Data being sent is corrupted or malformed.

**Solution:**
1. Clear browser cache and cookies
2. Log out and log back in
3. Refresh the page completely (Ctrl+F5)
4. Try again

---

### Error 3: "academicProfiles is not an array"

**Cause:** The academicProfiles field was initialized incorrectly.

**Solution:**
```bash
node fix-academic-profiles.mjs
```

This will convert it to the correct format automatically.

---

### Error 4: "Database connection error"

**Cause:** Can't connect to Neon PostgreSQL database.

**Solutions:**

**Check 1: Environment Variables on Vercel**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these exist:
   - `DATABASE_URL`
   - `POSTGRES_PRISMA_URL`
   - `SESSION_SECRET`
3. Values should match your Neon database credentials

**Check 2: Neon Database Status**
1. Go to [Neon Console](https://console.neon.tech)
2. Check your database is active
3. Verify connection string is correct

**Check 3: Local .env File**
```bash
# Check your .env file has:
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
SESSION_SECRET="your-secret-key"
```

---

### Error 5: "Unauthorized"

**Cause:** You're not logged in or session expired.

**Solution:**
1. Go to `/login` page
2. Login with credentials:
   - Username: `Mbita`
   - Password: `Mbita@12345`
3. Try updating profile again

---

## Enhanced Error Messages

The system now provides detailed error messages. Look for:

### In Browser Console:
```
Submitting profile update: { fullName: "...", email: "...", ... }
Profile update failed: { error: "...", details: [...] }
```

### In Toast Notifications:
- Success: "Profile updated successfully"
- Error with details: "Failed to update profile. Details: field: message"

---

## Step-by-Step Debugging

### Step 1: Check Local Database
```bash
node test-profile-update.mjs
```

If this **succeeds**, the issue is with Vercel deployment.  
If this **fails**, the issue is with your local database.

### Step 2: Check Vercel Logs
1. Open Vercel Dashboard
2. Go to your project
3. Click "Functions" tab
4. Look for `/api/admin/profile` logs
5. Find the error message

### Step 3: Check Network Request
1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Try updating profile
4. Click on the `/api/admin/profile` request
5. Check the **Response** tab for error details

### Step 4: Verify Data Format
Check that your profile data is in correct format:

```javascript
{
  "fullName": "Your Name",
  "title": "Professor",
  "department": "Your Department",
  "institution": "Your Institution",
  "email": "valid@email.com",
  "officeLocation": "Building, Room 123",
  "officeHours": "Mon-Fri 2-4 PM",
  "bio": "Your biography",
  "academicProfiles": []  // ← Must be an array
}
```

---

## Manual Database Update (Advanced)

If the admin panel doesn't work, you can update directly via Neon SQL Editor:

### Update Name:
```sql
UPDATE "Profile" 
SET "fullName" = 'Your New Name'
WHERE id = 1;
```

### Update Department:
```sql
UPDATE "Profile" 
SET "department" = 'Your New Department'
WHERE id = 1;
```

### Update Email:
```sql
UPDATE "Profile" 
SET "email" = 'your-new@email.com'
WHERE id = 1;
```

### Update Multiple Fields:
```sql
UPDATE "Profile" 
SET 
  "fullName" = 'Your Name',
  "email" = 'your@email.com',
  "department" = 'Your Department',
  "institution" = 'Your Institution'
WHERE id = 1;
```

---

## Reset Profile to Defaults

If everything is broken, reset to default:

```bash
# Run database initialization
node verify-setup.mjs
```

Or via API:
```
Visit: https://mbita-deogratias.vercel.app/api/init-db
```

⚠️ **Warning:** This will reset some settings but preserve your admin account.

---

## Prevention Tips

### ✅ DO:
- Fill all required fields
- Use valid email format
- Test locally before deploying
- Keep backups of important data
- Check Vercel logs after deployment

### ❌ DON'T:
- Leave required fields empty
- Use invalid email formats
- Paste code/HTML into text fields
- Update profile multiple times rapidly
- Close browser during save

---

## Still Not Working?

### Last Resort Options:

**Option 1: Redeploy**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

Wait for Vercel to finish deploying, then try again.

**Option 2: Check Database Schema**
```bash
npx prisma db pull
npx prisma generate
```

This ensures your local schema matches production.

**Option 3: Contact Support**

Provide:
1. Screenshot of error message
2. Output from `node test-profile-update.mjs`
3. Vercel function logs (screenshot)
4. What you were trying to update

---

## After Fixing

Once profile updates work:

1. ✅ Update your information:
   - Full name
   - Email
   - Department
   - Institution
   - Bio

2. ✅ Add academic profile links:
   - Go to "Academic Links" tab
   - Add Google Scholar, ORCID, etc.

3. ✅ Upload photos:
   - Use external URLs (Imgur, Google Drive)
   - Upload for each section

4. ✅ Test on public site:
   - Visit homepage
   - Check if changes appear
   - Verify all information is correct

---

## Summary

**Most Common Cause:** `academicProfiles` field format issue

**Quickest Fix:** 
```bash
node fix-academic-profiles.mjs
git add .
git commit -m "Fix profile updates"
git push origin main
```

**Success Indicators:**
- ✅ Test script passes
- ✅ Browser console shows no errors
- ✅ Toast shows "Profile updated successfully"
- ✅ Changes appear on public site

Your profile updates should now work correctly! 🎉
