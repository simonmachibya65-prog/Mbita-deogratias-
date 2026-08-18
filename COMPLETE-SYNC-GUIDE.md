# 🚀 Complete Academic Profile Sync Guide

## Overview

The **Complete Sync** feature automatically fetches **ALL** content from your academic profiles and imports it to the appropriate sections of your website.

## What Gets Synced

### 📚 Publications
- **Source**: Google Scholar, ORCID, Semantic Scholar, CrossRef, arXiv
- **Data**: Titles, authors, years, venues, citation counts
- **Destination**: Admin → Publications

### 👤 Profile Information
- **Source**: Google Scholar, ORCID
- **Data**: Name, affiliation, bio, profile statistics
- **Destination**: Admin → Profile Settings

### 👥 Co-authors / Collaborators
- **Source**: Google Scholar (co-authors section)
- **Data**: Names, profile URLs, Google Scholar IDs
- **Destination**: Admin → Collaborations

### 🔬 Research Interests
- **Source**: Google Scholar (interests/tags)
- **Data**: List of research areas and topics
- **Destination**: Admin → Profile Settings

### 🖼️ Profile Photo
- **Source**: Google Scholar profile image
- **Data**: Profile photo URL
- **Destination**: Admin → Gallery (category: Profile)

### 📊 Statistics
- **Source**: Google Scholar
- **Data**: 
  - Total citations
  - h-index
  - i10-index
- **Destination**: Displayed on profile/stats pages

## How to Use

### Step 1: Add Your Academic Profile Links

1. Go to **Admin → Profile → Academic Links Tab**
2. Add your profile URLs:
   - **Google Scholar**: `https://scholar.google.com/citations?user=YOUR_ID`
   - **ORCID**: `https://orcid.org/0000-0002-YOUR-ID`
   - **ResearchGate**: `https://www.researchgate.net/profile/YOUR_NAME`
   - And more!
3. Click **"Save Changes"**

### Step 2: Run Complete Sync

1. Go to **Admin → Complete Sync**
2. Click the big blue button: **"⚡ Sync Everything Now"**
3. Wait for the sync to complete (usually 10-30 seconds)
4. Review the results showing:
   - Number of publications imported
   - Number of collaborators added
   - Number of gallery items added

### Step 3: View Imported Content

Click the buttons to navigate to:
- **📄 View Publications** - See all imported papers
- **👥 View Collaborators** - See imported co-authors
- **🖼️ View Gallery** - See imported photos

## Differences Between Sync Types

### Auto-Sync (Publications Only)
- **URL**: `/admin/sync`
- **Focus**: Publications only
- **Sources**: 5+ sources in parallel
- **Features**: 
  - Preview before import
  - Detailed debug info
  - Individual source breakdown

### Complete Sync (Everything)
- **URL**: `/admin/sync-complete`
- **Focus**: ALL profile content
- **Sources**: Google Scholar + ORCID
- **Features**:
  - One-click import
  - Automatic categorization
  - Multi-section import

## Technical Details

### Supported Sources

#### Google Scholar (Full Support)
- ✅ Publications (title, year, citations)
- ✅ Profile name
- ✅ Affiliation
- ✅ Profile photo
- ✅ Citation statistics (total, h-index, i10-index)
- ✅ Co-authors with links
- ✅ Research interests/tags

#### ORCID (Full Support)
- ✅ Publications (title, year, venue)
- ✅ Profile name
- ✅ Biography/bio
- ✅ Works list

#### Semantic Scholar (Publications Only)
- ✅ Publications by name search
- ⚠️ No profile data available via API

#### CrossRef (Publications Only)
- ✅ Publications by name search
- ⚠️ No profile data available via API

#### arXiv (Publications Only)
- ✅ Preprints by name search
- ⚠️ No profile data available via API

### Data Mapping

| External Data | Database Table | Field Mapping |
|---------------|----------------|---------------|
| Publications | `Publication` | title, authors, year, venue, type, citations |
| Co-authors | `Collaborator` | name, profileUrl, type=individual |
| Profile photo | `GalleryItem` | imageUrl, category=Profile |
| Profile name | `Profile` | fullName |
| Affiliation | `Profile` | institution |
| Bio | `Profile` | bio |

### Duplicate Detection

The system automatically:
- ✅ Checks for existing publications by title (case-insensitive)
- ✅ Checks for existing collaborators by name (case-insensitive)
- ✅ Checks for existing gallery items by image URL
- ✅ Skips duplicates to avoid redundancy

## Troubleshooting

### No Publications Found
**Problem**: Sync returns 0 publications

**Solutions**:
1. Verify your Google Scholar profile is public
2. Check that your ORCID profile has works listed
3. Ensure your full name in Profile Settings matches your published name
4. Try adding the direct profile URLs in Academic Links

### Co-authors Not Importing
**Problem**: Collaborators count is 0

**Solution**:
- Only Google Scholar provides co-author data
- Ensure you have a Google Scholar profile linked
- Co-authors section must be visible on your profile

### Profile Photo Not Importing
**Problem**: Gallery items count is 0

**Solution**:
- Only Google Scholar profile photos are imported
- Ensure your Google Scholar profile has a photo uploaded
- Photo must be publicly accessible

### Import Errors
**Problem**: Sync fails with errors

**Solutions**:
1. Check Vercel logs for detailed error messages
2. Verify database connection is working
3. Ensure Prisma schema is up-to-date
4. Try the Auto-Sync page for more detailed debug info

## Best Practices

### 1. Regular Syncing
- Run Complete Sync monthly to keep content updated
- Use Auto-Sync for quick publication updates

### 2. Profile Maintenance
- Keep academic profiles updated with latest publications
- Ensure profile visibility settings are set to "public"
- Add complete author information to publications

### 3. Manual Review
- After sync, review imported content for accuracy
- Edit any incorrect data manually
- Add missing information (abstracts, PDFs, etc.)

### 4. Multiple Sources
- Add profile links from multiple platforms
- Google Scholar + ORCID gives best coverage
- More sources = more complete data

## Future Enhancements

Coming soon:
- 🔄 **Scheduled auto-sync** - Run sync automatically every week/month
- 📸 **Research images** - Import figures from publications
- 📹 **Presentation videos** - Sync from YouTube/Vimeo
- 🎓 **Teaching materials** - Import course syllabi
- 🏆 **Awards & honors** - Sync from LinkedIn/CV
- 📊 **Research datasets** - Import from Zenodo/Figshare
- 🌐 **Social media** - Sync from Twitter/LinkedIn

## Support

For issues or questions:
1. Check the debug info panel after sync
2. Review the Activity Log (Admin → Settings → Activity)
3. Check Vercel deployment logs
4. Contact support with specific error messages

---

**Last Updated**: 2024
**Version**: 2.0
