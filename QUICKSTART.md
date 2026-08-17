# 🚀 Quick Start Guide

Get your professor website up and running in 5 minutes!

## 📋 Prerequisites
- Node.js 18+ installed
- PostgreSQL database (get free tier from Vercel, Supabase, or Railway)
- Git installed

## ⚡ Quick Setup (Local Development)

### 1️⃣ Install Dependencies (if not done)
```bash
npm install
```

### 2️⃣ Set Up Database
Choose one of these free options:

**Option A: Vercel Postgres (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and create database
vercel login
vercel link
vercel env pull .env.local

# Or manually: Visit https://vercel.com/storage and create Postgres database
```

**Option B: Supabase**
1. Create free account at https://supabase.com
2. Create new project
3. Go to Settings > Database > Connection String
4. Copy "Connection pooling" string
5. Update `.env` DATABASE_URL

**Option C: Local PostgreSQL**
```bash
# Create database
createdb professor_website

# Update .env
DATABASE_URL="postgresql://localhost:5432/professor_website"
```

### 3️⃣ Configure .env File
Edit `.env` file (already created):
```env
# Update this with your database URL
DATABASE_URL="your-database-url-here"

# Update with your email
PROFESSOR_EMAIL="your-email@domain.com"

# For contact form (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Already set (don't change)
SESSION_SECRET="..." 
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4️⃣ Initialize Database
```bash
npx prisma db push
```

### 5️⃣ Start Development Server
```bash
npm run dev
```

🎉 **Visit http://localhost:3000**

### 6️⃣ Access Admin Panel
1. Go to http://localhost:3000/admin
2. Create your admin account
3. Log in and start customizing!

## 🌐 Deploy to Production (5 minutes)

### Option 1: Deploy with Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, then add environment variables in Vercel dashboard
```

**Or via Dashboard:**
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your repository
5. Add environment variables from `.env.production.example`
6. Click "Deploy"

### Option 2: Deploy with Netlify
```bash
npm i -g netlify-cli
netlify init
netlify deploy --prod
```

## 📧 Gmail Setup for Contact Form

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use generated password in `.env` as `SMTP_PASS`

## 🎨 First Steps After Setup

1. **Update Profile** (`/admin/profile`)
   - Upload your photo
   - Add bio and contact info
   - Link social profiles

2. **Configure Site** (`/admin/site-settings`)
   - Set site title
   - Customize footer
   - Toggle sections

3. **Add Content**
   - Publications
   - Research projects
   - Blog posts
   - Courses

## 🔧 Common Issues

**"Cannot connect to database"**
- Check DATABASE_URL is correct
- Ensure database is running
- For cloud databases, check IP whitelist

**"Email not sending"**
- Verify SMTP credentials
- For Gmail, use App Password, not regular password
- Check SMTP_PORT (587 for TLS)

**"Build fails on Vercel"**
- Ensure all environment variables are set
- Check DATABASE_URL includes `?sslmode=require` for cloud databases
- Verify Prisma can connect: `npx prisma db pull`

## 📚 Next Steps

- Read full [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Check [README.md](./README.md) for features overview
- Customize your theme and content

## 🆘 Need Help?

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Docs**: https://vercel.com/docs

## 🎯 Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` configured with database URL
- [ ] Database initialized (`npx prisma db push`)
- [ ] Email configured (SMTP settings)
- [ ] Local development works (`npm run dev`)
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel/Netlify
- [ ] Production environment variables set
- [ ] SSL enabled (automatic on Vercel)
- [ ] Admin account created
- [ ] Profile information updated

---

**Ready to launch! 🚀**
