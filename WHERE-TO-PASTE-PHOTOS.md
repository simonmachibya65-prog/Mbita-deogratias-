# Where to Paste Photo Links - Complete Guide

## 🎯 QUICK ANSWER

After uploading to Imgur and copying the image URL, here's where to paste it:

---

## Method 1: Using Admin → Profile (EASIEST)

### Step-by-Step:

1. **Login to Admin**
   - URL: https://mbita-deogratias.vercel.app/login
   - Username: `Mbita`
   - Password: `Mbita@12345`

2. **Go to Profile**
   - Look at left sidebar
   - Click **"Profile"** (under "Content" section)

3. **Click "Profile Info" Tab**
   - At the top, you'll see 3 tabs
   - Click **"👤 Profile Info"**

4. **Find Photo URL Field**
   - Scroll through the form
   - Look for **"Photo URL"** or **"Profile Photo URL"** field
   - It's a text input box

5. **Paste Your Imgur Link**
   - Click in the text box
   - Press Ctrl+V (or right-click → Paste)
   - Your link should look like: `https://i.imgur.com/ABC123.jpg`

6. **Save**
   - Scroll to bottom
   - Click **"Save Profile"** button
   - Wait for success message

7. **Verify**
   - Go to your public site: https://mbita-deogratias.vercel.app
   - Your photo should appear!

---

## Method 2: Direct Database Update (If Above Doesn't Work)

If the profile page doesn't have a Photo URL field, use this method:

### Via Neon PostgreSQL Console:

1. **Login to Neon**
   - Go to: https://console.neon.tech
   - Login to your account

2. **Open SQL Editor**
   - Select your database
   - Click "SQL Editor"

3. **Run Update Query**
   ```sql
   UPDATE "Profile" 
   SET "photoUrl" = 'https://i.imgur.com/YOUR_IMAGE_ID.jpg'
   WHERE id = 1;
   ```
   
   **Replace** `YOUR_IMAGE_ID` with your actual Imgur ID

4. **Click "Run"**
   - Query executes
   - Photo URL is saved

5. **Refresh Your Site**
   - Go to: https://mbita-deogratias.vercel.app
   - Your photo should now appear!

---

## Method 3: Update via API (Advanced)

You can also update via the API endpoint:

### Using Browser Console:

1. **Open Your Admin Panel**
   - https://mbita-deogratias.vercel.app/admin

2. **Open Browser Console**
   - Press F12
   - Click "Console" tab

3. **Run This Code**
   ```javascript
   fetch('/api/admin/profile', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       photoUrl: 'https://i.imgur.com/YOUR_IMAGE_ID.jpg',
       // You need to include other required fields
       fullName: 'Your Name',
       title: 'Your Title',
       department: 'Your Department',
       institution: 'Your Institution',
       email: 'your@email.com',
       officeLocation: 'Your Office',
       officeHours: 'Your Hours',
       bio: 'Your Bio'
     })
   })
   .then(r => r.json())
   .then(d => console.log('Updated:', d))
   ```

4. **Press Enter**
   - Photo URL is updated
   - Check your site!

---

## 🖼️ All Photo Fields in Profile

When you're in **Admin → Profile → Profile Info**, you can set:

| Field Name | Description | Where It Appears |
|------------|-------------|------------------|
| `photoUrl` | Main profile photo | Homepage, About, everywhere |
| `navbarPhotoUrl` | Navigation bar photo | Top menu bar |
| `heroPhotoUrl` | Homepage hero photo | Large photo on homepage |
| `aboutPhotoUrl` | About page photo | About page |
| `contactPhotoUrl` | Contact page photo | Contact page |
| `footerPhotoUrl` | Footer photo | Bottom of all pages |
| `adminPhotoUrl` | Admin panel photo | Admin sidebar |

**Note:** If you only set `photoUrl` (Main photo), it will be used everywhere automatically!

---

## 📋 Example: Complete Workflow

### From Start to Finish:

```
1. Upload Photo to Imgur
   ↓
   Go to: https://imgur.com/upload
   Upload your photo
   Right-click image → "Copy image address"
   You get: https://i.imgur.com/ABC123.jpg

2. Login to Admin Panel
   ↓
   Go to: https://mbita-deogratias.vercel.app/login
   Username: Mbita
   Password: Mbita@12345

3. Go to Profile
   ↓
   Left sidebar → Content → Profile

4. Click Profile Info Tab
   ↓
   Top tabs → "👤 Profile Info"

5. Find Photo URL Field
   ↓
   Scroll through form
   Look for "Photo URL" or "photoUrl" field

6. Paste Imgur Link
   ↓
   Click in text box
   Ctrl+V to paste
   https://i.imgur.com/ABC123.jpg

7. Save
   ↓
   Scroll to bottom
   Click "Save Profile"
   Wait for "Success" message

8. Check Your Site
   ↓
   Visit: https://mbita-deogratias.vercel.app
   Your photo should be visible!
```

---

## 🚨 Troubleshooting

### "I don't see a Photo URL field"

**Solution 1: Check Profile Info Tab**
- Make sure you're on "Profile Info" tab, not "Photos" tab
- The Photos tab is for file uploads (doesn't work on Vercel)
- The Profile Info tab should have text input fields

**Solution 2: Use Database Method**
- Use Method 2 above (Neon SQL Editor)
- Direct database update always works

### "I pasted the link but photo doesn't show"

**Check these:**

1. **Is URL correct?**
   - Must start with `https://`
   - Must be direct image link (ending in .jpg, .png, .webp)
   - Example: `https://i.imgur.com/ABC123.jpg`

2. **Is URL publicly accessible?**
   - Open URL in new browser tab
   - If image loads, URL is good!

3. **Did you save changes?**
   - Make sure you clicked "Save Profile"
   - Wait for success message

4. **Clear browser cache**
   - Press Ctrl+F5 to hard refresh
   - Or clear browser cache

### "Save Profile button doesn't work"

**Check required fields:**
All these fields must be filled:
- Full Name
- Title
- Department
- Institution
- Email
- Office Location
- Office Hours
- Bio

If any are empty, fill them first, then save.

---

## ✅ Quick Reference

**Upload Photo:**
1. https://imgur.com/upload
2. Upload → Right-click → "Copy image address"

**Paste Photo Link:**
1. https://mbita-deogratias.vercel.app/login
2. Admin → Profile → Profile Info tab
3. Find "Photo URL" field
4. Paste link → Save

**Check Result:**
1. https://mbita-deogratias.vercel.app
2. Your photo should appear!

---

## 📞 Still Need Help?

If none of these methods work, you can:

1. **Use Neon SQL Editor** (Method 2) - Most reliable
2. **Check browser console** for error messages (F12 → Console)
3. **Verify Imgur link** works in new tab
4. **Try different photo** to test if it's the image file

Your photo will work! Just follow Method 1 or Method 2 above. 🎉
