# Academic Profile Links - Setup Guide

## Overview
The Academic Profile Links feature allows you to add links to your external academic profiles (Google Scholar, ORCID, ResearchGate, etc.) that appear on your homepage and contact page.

---

## Fix "Not Found" Error

If you're getting a "Not Found" error when trying to access the Academic Links tab, follow these steps:

### Step 1: Run the Fix Script Locally
```bash
node fix-academic-profiles.mjs
```

This script will:
- Check if your profile exists
- Ensure `academicProfiles` is properly initialized as an array
- Fix any data type issues

### Step 2: Access via Vercel (if deployed)
If you're already deployed on Vercel, the fix needs to be applied to the production database:

1. **Push the updated code to GitHub:**
   ```bash
   git add .
   git commit -m "Fix academic profiles initialization"
   git push origin main
   ```

2. **Vercel will automatically redeploy**

3. **After deployment, visit:**
   ```
   https://mbita-deogratias.vercel.app/admin/profile
   ```

4. **Click on the "🔗 Academic Links" tab**

---

## How to Add Academic Profile Links

### Method 1: Through Admin Panel (Recommended)

1. **Login to Admin Panel:**
   - Go to: `https://mbita-deogratias.vercel.app/login`
   - Username: `Mbita`
   - Password: `Mbita@12345`

2. **Navigate to Profile:**
   - Click **"Profile"** in the admin sidebar

3. **Go to Academic Links Tab:**
   - Click the **"🔗 Academic Links"** tab

4. **Add Profile Links:**
   - Click **"+ Add Profile Link"**
   - Enter **Label** (e.g., "Google Scholar", "ORCID", "ResearchGate")
   - Enter **URL** (full URL to your profile)
   - Click **"Save Links"**

### Example Academic Profile Links:

| Label | URL Example |
|-------|-------------|
| Google Scholar | `https://scholar.google.com/citations?user=YOUR_ID` |
| ORCID | `https://orcid.org/0000-0000-0000-0000` |
| ResearchGate | `https://www.researchgate.net/profile/Your-Name` |
| LinkedIn | `https://www.linkedin.com/in/your-profile` |
| GitHub | `https://github.com/yourusername` |
| Semantic Scholar | `https://www.semanticscholar.org/author/YOUR_ID` |
| Scopus | `https://www.scopus.com/authid/detail.uri?authorId=YOUR_ID` |
| Web of Science | `https://www.webofscience.com/wos/author/rid/YOUR_ID` |

---

## Method 2: Through Database (Advanced)

If you need to update directly via database:

### SQL Query:
```sql
UPDATE "Profile" 
SET "academicProfiles" = '[
  {"label": "Google Scholar", "url": "https://scholar.google.com/citations?user=YOUR_ID"},
  {"label": "ORCID", "url": "https://orcid.org/0000-0000-0000-0000"},
  {"label": "ResearchGate", "url": "https://www.researchgate.net/profile/Your-Name"}
]'::jsonb
WHERE id = 1;
```

### Via Prisma (Node.js):
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.profile.update({
  where: { id: 1 },
  data: {
    academicProfiles: [
      { label: "Google Scholar", url: "https://scholar.google.com/citations?user=YOUR_ID" },
      { label: "ORCID", url: "https://orcid.org/0000-0000-0000-0000" },
      { label: "ResearchGate", url: "https://www.researchgate.net/profile/Your-Name" }
    ]
  }
});
```

---

## Where Do These Links Appear?

Your academic profile links will automatically appear in:

1. **Homepage:**
   - In the hero section below your bio
   - Styled as icon buttons

2. **Contact Page:**
   - In the contact information section
   - Listed with labels and clickable links

3. **About Page:**
   - Below your biography
   - Formatted as professional profile badges

---

## Troubleshooting

### Error: "Not Found" or 404

**Cause:** The `academicProfiles` field in your database is not properly initialized.

**Fix:**
1. Run the fix script: `node fix-academic-profiles.mjs`
2. Or visit: `/api/init-db` to reinitialize
3. Push changes to GitHub and redeploy on Vercel

### Error: "Cannot read property 'map' of undefined"

**Cause:** The profile doesn't have the `academicProfiles` field.

**Fix:** Same as above - run the fix script.

### Links Not Showing on Homepage

**Check:**
1. Did you save the links in the admin panel?
2. Are the URLs valid and complete (including `https://`)?
3. Clear your browser cache
4. Check if the profile was successfully updated:
   ```bash
   node fix-academic-profiles.mjs
   ```

---

## Integration with Auto-Sync

The academic profile links work together with the Auto-Sync feature:

1. **Add your profile links** through Admin → Profile → Academic Links
2. **Use Auto-Sync** at Admin → Auto-Sync to fetch publications
3. The system will use these URLs to:
   - Extract your profile IDs automatically
   - Fetch publications from each platform
   - Keep your publication list updated

---

## API Documentation

### GET /api/admin/profile
Returns the profile including `academicProfiles` array.

**Response:**
```json
{
  "id": 1,
  "fullName": "Professor Name",
  "academicProfiles": [
    {
      "label": "Google Scholar",
      "url": "https://scholar.google.com/..."
    }
  ]
}
```

### PUT /api/admin/profile
Updates the profile including academic profiles.

**Request Body:**
```json
{
  "academicProfiles": [
    { "label": "ORCID", "url": "https://orcid.org/..." }
  ]
}
```

---

## Need Help?

If you're still experiencing issues:

1. **Check the fix script output:**
   ```bash
   node fix-academic-profiles.mjs
   ```

2. **Verify database connection:**
   ```bash
   node verify-setup.mjs
   ```

3. **Check Vercel logs:**
   - Go to Vercel Dashboard
   - Click on your project
   - View runtime logs

4. **Contact support** with:
   - Error message
   - Screenshot of the issue
   - Output from fix script

---

## Summary

✅ **Fixed:** `academicProfiles` initialization issue  
✅ **Location:** Admin → Profile → Academic Links tab  
✅ **Format:** Array of `{label, url}` objects  
✅ **Displays:** Homepage, Contact page, About page  
✅ **Integration:** Works with Auto-Sync feature  

Your academic profile links are now ready to use! 🎓
