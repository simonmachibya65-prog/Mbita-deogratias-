# 🚨 Known Issues & Solutions

## 1. Image Upload Fails in Production

### Problem:
Vercel's filesystem is **read-only**. You cannot save uploaded files to `/public/images` in production.

### Solution Options:

#### Option A: Use Vercel Blob Storage (Recommended)

1. **Install Vercel Blob package:**
```bash
npm install @vercel/blob
```

2. **Add environment variable in Vercel:**
   - Go to Settings → Environment Variables
   - `BLOB_READ_WRITE_TOKEN` will be auto-added when you enable Blob Storage

3. **Enable Blob Storage:**
   - In Vercel Dashboard → Storage → Blob
   - Click "Create Database"

#### Option B: Use Cloudinary (Free tier available)

1. Sign up at https://cloudinary.com
2. Get your API credentials
3. Add to Vercel environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

#### Option C: Use External Image URLs

For now, you can use image URLs from:
- **Imgur**: Upload to https://imgur.com and paste the URL
- **Google Drive**: Share publicly and use direct link
- **GitHub**: Upload to a GitHub repo and use raw URL

### Temporary Workaround:

Instead of uploading, paste image URLs directly:
1. Upload your image to Imgur or Google Drive
2. Copy the direct image URL
3. Paste the URL in the photo URL field (not file upload)

---

## 2. Auto-Fetch from Google Scholar / Academic Profiles

### Current Status:
The database has fields for academic profiles, but auto-sync is not yet implemented.

### What's Already There:
- ✅ Database schema supports auto-sync (`ConnectedAccount`, `SyncedContent` models)
- ✅ Profile has `academicProfiles` JSON field for storing links
- ✅ Fields for ORCID, Google Scholar, ResearchGate, etc.

### To Implement Auto-Sync:

You'll need to:

1. **Add API keys/tokens** for academic platforms
2. **Create sync endpoints** that fetch from each platform
3. **Schedule automatic syncing** (daily/weekly)

### Quick Fix for Now:

**Manual Entry:**
- Go to Admin → Publications
- Manually add your publications
- This is actually recommended for accuracy

**Future Enhancement:**
I can help you implement full auto-sync from:
- ORCID (has official API)
- Google Scholar (requires scraping - less reliable)
- ResearchGate
- PubMed
- arXiv

---

## 3. How to Add Your Academic Links

### In Admin Panel → Profile:

1. Scroll to "Academic Profiles" section
2. Add your profile URLs:
   ```
   Google Scholar: https://scholar.google.com/citations?user=YOUR_ID
   ORCID: https://orcid.org/0000-0000-0000-0000
   ResearchGate: https://www.researchgate.net/profile/Your-Name
   LinkedIn: https://linkedin.com/in/yourname
   Twitter: https://twitter.com/yourhandle
   GitHub: https://github.com/yourusername
   ```

3. These will appear as social links on your public site

---

## 4. Current Workarounds

### For Images:
**Use Imgur for now:**
1. Go to https://imgur.com
2. Upload your image
3. Right-click → "Copy image address"
4. Paste this URL in admin panel

### For Publications:
**Manual entry for now:**
1. Admin → Publications → Add New
2. Fill in:
   - Title
   - Authors (as JSON array: `["Author 1", "Author 2"]`)
   - Venue
   - Year
   - DOI / URL
   - PDF URL (if you have one hosted somewhere)

---

## 5. Next Steps to Fix

### Priority 1: Image Upload
Need to implement Vercel Blob or Cloudinary integration

### Priority 2: Publication Auto-Sync
Options:
- **ORCID API** (most reliable, requires ORCID account)
- **Semantic Scholar API** (free, good coverage)
- **CrossRef API** (for DOI lookups)

### Priority 3: Enhanced Features
- Bulk import from BibTeX
- PDF upload and hosting
- Citation metrics tracking

---

## Need Help?

Let me know if you want me to:
1. Implement Vercel Blob storage for images
2. Add ORCID API integration for auto-sync
3. Create a bulk import feature for publications
4. Any other specific feature

---

**Your site is LIVE and functional!** These are enhancements that can be added as needed.

**Live Site:** https://mbita-deogratias.vercel.app
**Admin Panel:** https://mbita-deogratias.vercel.app/login
