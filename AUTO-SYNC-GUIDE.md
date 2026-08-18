# 🔄 Academic Profile Auto-Sync Guide

Your website now has **automatic publication fetching** from multiple academic sources!

## ✅ What's Been Added

### 1. Auto-Sync System
- ✅ **ORCID** - Most reliable, official API
- ✅ **Semantic Scholar** - Free API, excellent coverage
- ✅ **Google Scholar** - Web scraping (use sparingly)
- ✅ **CrossRef** - DOI-based lookup

### 2. Admin Interface
- ✅ New **"Auto-Sync"** page in admin panel
- ✅ Preview publications before importing
- ✅ One-click import to database
- ✅ Duplicate detection (won't import twice)

### 3. Automatic Deduplication
- Publications with same title are automatically skipped
- Safe to run multiple times

## 🚀 How to Use

### Step 1: Add Your Academic Profiles

1. Go to **Admin → Profile**
2. Scroll to "Academic Profiles" section
3. Add your profiles:

```
ORCID ID: 0000-0002-1825-0097
Google Scholar: https://scholar.google.com/citations?user=YOUR_ID
ResearchGate: https://www.researchgate.net/profile/Your-Name
```

### Step 2: Run Auto-Sync

1. Go to **Admin → Auto-Sync** (new menu item)
2. Click **"🔍 Preview Publications"** to see what will be imported
3. Review the list
4. Click **"⬇️ Fetch & Import Now"** to save to database

### Step 3: View & Edit

1. Go to **Admin → Publications**
2. All imported publications are there
3. Edit any publication to add:
   - PDF files
   - Abstract
   - Custom tags
   - Cover images

## 📊 What Gets Imported

For each publication:
- ✅ Title
- ✅ Authors
- ✅ Venue (Journal/Conference)
- ✅ Year
- ✅ DOI
- ✅ URL
- ✅ Abstract (if available)
- ✅ Citation count (if available)

## 🎯 Best Practices

### Most Reliable: ORCID
1. Create account at https://orcid.org (free)
2. Add publications to your ORCID profile
3. Copy your ORCID ID (format: 0000-0002-1825-0097)
4. Add to Profile → ORCID ID field
5. Run sync

### Good Alternative: Semantic Scholar
- No signup needed
- Automatically finds publications by your name
- Works best if your name is unique

### Backup: Google Scholar
- May be rate-limited
- Use if ORCID/Semantic Scholar don't work
- Extract user ID from your Google Scholar URL

## ⚠️ Important Notes

### Rate Limiting
- **ORCID**: No limits, very reliable
- **Semantic Scholar**: 100 requests/5 minutes
- **Google Scholar**: May block if used too frequently

### Recommendations:
- ✅ Run sync once per week or month
- ✅ Use ORCID as primary source
- ❌ Don't run Google Scholar sync every hour

### Data Quality
- ORCID: ⭐⭐⭐⭐⭐ (Official, maintained by you)
- Semantic Scholar: ⭐⭐⭐⭐ (AI-powered, good coverage)
- Google Scholar: ⭐⭐⭐ (Comprehensive but may have duplicates)

## 🔧 Troubleshooting

### "No publications found"
**Solution:**
1. Verify your ORCID ID is correct
2. Check your Google Scholar URL includes `?user=`
3. Try adding publications manually if sync fails

### "Some sources failed"
**Solution:**
- This is normal! Some sources may be down or rate-limited
- Check which sources succeeded in the message
- Try again later for failed sources

### Duplicates imported
**Solution:**
- The system checks by title (case-insensitive)
- If duplicates exist, go to Publications and delete extras
- Future syncs won't re-import

## 📋 Manual Import Alternative

If auto-sync doesn't work, you can:

### Option 1: BibTeX Import (Future Feature)
Export from Google Scholar → Upload .bib file

### Option 2: Manual Entry
Admin → Publications → Add New

## 🎓 Supported Academic Platforms

| Platform | Method | Reliability | Setup Required |
|----------|--------|-------------|----------------|
| **ORCID** | Official API | ⭐⭐⭐⭐⭐ | ORCID account + ID |
| **Semantic Scholar** | API | ⭐⭐⭐⭐ | None (uses name) |
| **Google Scholar** | Scraping | ⭐⭐⭐ | Profile URL |
| **CrossRef** | API | ⭐⭐⭐⭐ | None (uses name) |

### Coming Soon:
- ResearchGate
- PubMed
- arXiv
- IEEE Xplore

## 🔄 Automatic Scheduling (Future)

Currently: Manual sync via admin panel

Future: 
- Daily auto-sync (configurable)
- Email notifications when new pubs found
- Webhook to external systems

## ⚙️ For Developers

### API Endpoints

**Preview (GET):**
```
GET /api/admin/sync-academic
```

**Import (POST):**
```
POST /api/admin/sync-academic
```

### Library Functions

```typescript
import { syncAcademicProfiles, importPublications } from '@/lib/academicSync';

// Fetch from all sources
const result = await syncAcademicProfiles();

// Import to database
const count = await importPublications(result.publications);
```

## 📞 Need Help?

### Common Issues:
1. **No ORCID publications found** → Add publications to your ORCID profile first
2. **Google Scholar blocked** → Wait 24 hours, use ORCID instead
3. **Wrong author detected** → Use ORCID for accurate results

### Want to add more sources?
Let me know and I can integrate:
- ResearchGate
- Academia.edu
- PubMed
- arXiv
- IEEE Xplore
- ACM Digital Library

---

## ✨ Summary

You now have a **complete auto-sync system** that:
- ✅ Fetches publications from multiple sources
- ✅ Automatically deduplicates
- ✅ One-click import
- ✅ Works with ORCID, Semantic Scholar, Google Scholar
- ✅ Admin UI for easy management

**Your site:** https://mbita-deogratias.vercel.app
**Admin:** https://mbita-deogratias.vercel.app/admin/sync

🎉 **Ready to use after next deployment!**
