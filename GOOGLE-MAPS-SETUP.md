# 🗺️ Google Maps Setup Guide

## How to Add Map to Contact Page

Your contact page shows a "Location" section with a Google Maps embed. Follow these steps to add your office location:

---

## Method 1: Use Auto-Detect GPS (Easiest)

1. Go to: https://mbita-deogratias.vercel.app/admin/profile
2. Login (Username: `Mbita`, Password: `Mbita@12345`)
3. Click **"Profile Info"** tab
4. Scroll to **"Google Maps Embed URL"** field
5. Click the blue **"Auto-Detect"** button
6. Allow location access when browser asks
7. Map URL fills automatically with your GPS location
8. Click **"Save Profile"**
9. ✅ Done! Go to https://mbita-deogratias.vercel.app/contact to see map

---

## Method 2: Get Google Maps Embed URL Manually

### Step 1: Go to Google Maps
Open: https://www.google.com/maps

### Step 2: Find Your Location
- Search for your office address, OR
- Right-click on your location on the map
- Select "What's here?"
- Note the coordinates (latitude, longitude)

### Step 3: Get Embed Code
1. Click the **"Share"** button
2. Click **"Embed a map"** tab
3. Select size (Medium or Large recommended)
4. **Copy the URL inside the `src="..."` attribute**

Example:
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345..." ...>
```

Copy only this part:
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345...
```

### Step 4: Add to Your Profile
1. Go to: https://mbita-deogratias.vercel.app/admin/profile
2. Click **"Profile Info"** tab
3. Scroll to **"Google Maps Embed URL"**
4. Paste the URL
5. Click **"Save Profile"**

---

## Method 3: Use Coordinates Directly

If you know your latitude and longitude:

1. Format: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d[LONGITUDE]!3d[LATITUDE]!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s`

2. Replace:
   - `[LATITUDE]` with your latitude (e.g., `-6.7924`)
   - `[LONGITUDE]` with your longitude (e.g., `39.2083`)

3. Paste the URL in Admin → Profile → Profile Info → Google Maps Embed URL

---

## Example URLs

### Tanzania - Dar es Salaam
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.5936!2d39.2083!3d-6.7924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNDcnMzIuNiJTIDM5wrAxMicyOS45IkU!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s
```

### Kenya - Nairobi
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8!2d36.8219!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTcnMzEuNiJTIDM2wrA0OScxOC44IkU!5e0!3m2!1sen!2s!4v1234567890!5m2!1sen!2s
```

---

## Troubleshooting

### Map doesn't show (blank or error)
**Problem:** Invalid or missing URL

**Solution:**
1. Make sure you copied the complete URL starting with `https://www.google.com/maps/embed?pb=`
2. Don't include `<iframe` or other HTML tags - just the URL
3. Try the Auto-Detect button instead

### Map shows wrong location
**Problem:** Old coordinates or wrong address

**Solution:**
1. Go to Google Maps and verify your location
2. Get new embed URL
3. Update in Admin → Profile → Profile Info
4. Save changes

### Can't find "Share" or "Embed" option
**Problem:** Using Google Maps mobile app

**Solution:**
Use desktop browser version of Google Maps (https://www.google.com/maps) - embed option is only available on desktop

---

## Video Tutorial

Can't figure it out? Watch this:
https://support.google.com/maps/answer/144361

---

## Current Status

- ✅ Map functionality is fully coded
- ✅ Database field exists (`mapEmbedUrl`)
- ✅ Auto-detect GPS button available
- ⚠️ You need to add your location URL

**Next Step:** Use Auto-Detect button or paste your Google Maps embed URL in Admin → Profile → Profile Info!
