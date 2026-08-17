# 🚀 Deployment Checklist

Use this checklist to ensure your professor website is fully ready for production deployment.

## ✅ Pre-Deployment

### 1. Local Setup
- [x] Dependencies installed (`npm install`)
- [x] `.env` file created with secure SESSION_SECRET
- [ ] Database URL configured in `.env`
- [ ] Email (SMTP) configured in `.env`
- [ ] Professor email set in `.env`
- [ ] Base URL set in `.env`

### 2. Database Setup
- [ ] PostgreSQL database created
- [ ] Database connection tested
- [ ] Prisma schema pushed: `npx prisma db push`
- [ ] Database seeded (optional): `npm run prisma:seed`

### 3. Local Testing
- [ ] Development server runs: `npm run dev`
- [ ] Website accessible at http://localhost:3000
- [ ] Admin panel accessible at http://localhost:3000/admin
- [ ] Admin account created successfully
- [ ] Profile page loads without errors
- [ ] Contact form sends emails
- [ ] File uploads work

### 4. Build Testing
- [ ] Production build succeeds: `npm run build`
- [ ] No critical TypeScript errors
- [ ] No critical ESLint errors
- [ ] Build outputs to `.next` directory

### 5. Version Control
- [ ] Code pushed to GitHub/GitLab
- [ ] `.env` is in `.gitignore` (already set)
- [ ] Sensitive data not committed
- [ ] README.md updated with your info
- [ ] License file added (if applicable)

## 🌐 Deployment Platform Setup

### Vercel (Recommended)
- [ ] Vercel account created
- [ ] Project connected to Git repository
- [ ] Environment variables added in Vercel dashboard:
  - [ ] `DATABASE_URL`
  - [ ] `SESSION_SECRET`
  - [ ] `PROFESSOR_EMAIL`
  - [ ] `NEXT_PUBLIC_BASE_URL` (your Vercel domain)
  - [ ] `SMTP_HOST`
  - [ ] `SMTP_PORT`
  - [ ] `SMTP_USER`
  - [ ] `SMTP_PASS`
  - [ ] Optional: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, etc.
- [ ] Deployment triggered
- [ ] Deployment successful
- [ ] Build logs checked (no errors)

### Alternative Platforms
If using Netlify, Railway, or other:
- [ ] Platform account created
- [ ] Project connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Deployment successful

## 🔐 Security Configuration

### SSL/HTTPS
- [ ] SSL certificate active (automatic on Vercel)
- [ ] HTTPS enforced (no HTTP access)
- [ ] Mixed content warnings resolved

### Authentication
- [ ] Admin password is strong
- [ ] 2FA enabled for admin account
- [ ] Session secret is secure (32+ characters)
- [ ] No default/test credentials in production

### Database
- [ ] Database has strong password
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] Database backups configured
- [ ] Connection string is not exposed

## 🎯 Post-Deployment

### 1. Initial Setup
- [ ] Website loads at production URL
- [ ] Admin panel accessible
- [ ] Logged in to admin account
- [ ] Profile information updated:
  - [ ] Name and title
  - [ ] Bio
  - [ ] Photos uploaded
  - [ ] Contact information
  - [ ] Social media links
  - [ ] Academic profiles (ORCID, Google Scholar, etc.)

### 2. Site Configuration
- [ ] Site settings configured:
  - [ ] Site title
  - [ ] Tagline
  - [ ] Footer text
  - [ ] Contact email
  - [ ] Social links
- [ ] Navigation menu customized
- [ ] Home page sections toggled as desired
- [ ] Maintenance mode OFF

### 3. Content
- [ ] At least 1 publication added
- [ ] At least 1 research project added
- [ ] At least 1 course added
- [ ] About page filled out
- [ ] Teaching page has content
- [ ] First blog post (optional)
- [ ] Testimonials added (optional)

### 4. Functionality Testing
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Contact form tested (email received)
- [ ] Image uploads work
- [ ] Search works (if applicable)
- [ ] Mobile responsive
- [ ] No console errors in browser
- [ ] No broken links
- [ ] Forms validate properly
- [ ] File downloads work

### 5. SEO & Analytics
- [ ] `NEXT_PUBLIC_BASE_URL` set to production domain
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt accessible: `/robots.txt`
- [ ] Meta descriptions added
- [ ] Open Graph tags working
- [ ] Google Analytics/Vercel Analytics configured
- [ ] Google Search Console verified
- [ ] Submitted sitemap to search engines

### 6. Performance
- [ ] Page load times acceptable (<3s)
- [ ] Images optimized
- [ ] Lighthouse score checked (aim for 90+)
- [ ] No console warnings
- [ ] Database queries optimized

### 7. Custom Domain (Optional)
- [ ] Custom domain purchased
- [ ] DNS configured
- [ ] Domain added to Vercel/platform
- [ ] SSL certificate issued for custom domain
- [ ] Domain redirects working (www → non-www or vice versa)

## 🔧 Optional Features

### AI Chatbot
- [ ] OpenAI API key added
- [ ] Chatbot tested on live site
- [ ] Rate limiting configured

### Stripe Payments
- [ ] Stripe account created
- [ ] Stripe keys added (live, not test)
- [ ] Webhook endpoint configured
- [ ] Test payment completed
- [ ] Webhook secret added

### Email Integration
- [ ] SMTP working for contact form
- [ ] Test emails sent successfully
- [ ] Email templates customized
- [ ] Reply-to address configured

### ORCID Integration
- [ ] ORCID ID added
- [ ] Publication sync tested
- [ ] Auto-sync enabled/disabled as desired

### Live Chat
- [ ] Tawk.to account created
- [ ] Widget ID added
- [ ] Chat widget appears on site
- [ ] Chat tested

## 📊 Monitoring & Maintenance

### Set Up
- [ ] Uptime monitoring configured (e.g., UptimeRobot)
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Backup schedule set
- [ ] Update reminder set

### Regular Tasks
- [ ] Weekly content updates planned
- [ ] Monthly dependency updates: `npm update`
- [ ] Quarterly security audit
- [ ] Database backups verified

## 🎉 Launch

- [ ] All critical items above completed
- [ ] Final testing on all devices
- [ ] Announcement prepared
- [ ] Social media posts scheduled
- [ ] Email to colleagues sent
- [ ] University/department notified

## 📝 Post-Launch

### Week 1
- [ ] Monitor analytics daily
- [ ] Check for errors in logs
- [ ] Respond to contact form messages
- [ ] Fix any reported bugs

### Month 1
- [ ] Review analytics
- [ ] Gather user feedback
- [ ] Add requested features
- [ ] Update content regularly

---

## Quick Commands Reference

```bash
# Setup
npm install
node setup-wizard.mjs
npx prisma db push

# Development
npm run dev

# Testing
npm run build
node verify-setup.mjs

# Deployment
git push origin main
vercel --prod

# Maintenance
npm update
npx prisma migrate deploy
```

---

**✅ When all items are checked, you're ready to go live!**

For issues, see [DEPLOYMENT.md](./DEPLOYMENT.md) or [QUICKSTART.md](./QUICKSTART.md)
