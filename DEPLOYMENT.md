# Deployment Guide

This guide will help you deploy your professor website to production.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git installed
- Vercel account (or other hosting platform)

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Required Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secure random string (already generated)
- `PROFESSOR_EMAIL`: Your email address
- `NEXT_PUBLIC_BASE_URL`: Your website URL

**Email Configuration (for contact form):**
- `SMTP_HOST`: SMTP server (e.g., smtp.gmail.com)
- `SMTP_PORT`: Usually 587 for TLS
- `SMTP_USER`: Your email
- `SMTP_PASS`: Your email password or app-specific password

**Optional Features:**
- `OPENAI_API_KEY`: For AI chatbot assistant
- `STRIPE_SECRET_KEY`: For marketplace payments
- `ORCID_ID`: For auto-syncing publications
- `NEXT_PUBLIC_TAWKTO_ID`: For live chat widget

### 3. Set Up Database

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL, then create database
createdb professor_website

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://localhost:5432/professor_website"

# Push schema to database
npx prisma db push

# Optional: Seed with sample data
npm run prisma:seed
```

#### Option B: Cloud Database (Recommended for Production)

**Vercel Postgres:**
1. Go to https://vercel.com/storage
2. Create a new Postgres database
3. Copy the connection string to `.env`

**Supabase:**
1. Create project at https://supabase.com
2. Go to Settings > Database
3. Copy connection string (Transaction pooler)
4. Update `.env` with connection string

**Railway:**
1. Create project at https://railway.app
2. Add PostgreSQL service
3. Copy connection string to `.env`

**Neon:**
1. Create project at https://neon.tech
2. Copy connection string to `.env`

After setting up database:
```bash
npx prisma db push
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/professor-website.git
git push -u origin main
```

### 2. Deploy on Vercel

#### Via Vercel Dashboard:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from `.env` file
   - **Important:** Use production values, not localhost
   - Set `NEXT_PUBLIC_BASE_URL` to your Vercel URL
5. Click "Deploy"

#### Via Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel
```

### 3. Configure Database
- If using Vercel Postgres, connection is automatic
- For external database, ensure it accepts connections from Vercel's IP ranges
- Add `DATABASE_URL` in Vercel environment variables

### 4. First Deploy Actions
After first deployment:

1. **Set up admin account:**
   - Visit https://your-domain.com/admin
   - Create your admin account
   - Enable 2FA for security

2. **Configure profile:**
   - Go to Profile Settings
   - Upload your photo
   - Fill in academic information

3. **Update site settings:**
   - Configure site title and tagline
   - Set social media links
   - Toggle visible sections

## Deployment to Other Platforms

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify init
netlify deploy --prod
```

Add these build settings:
- Build command: `npm run build`
- Publish directory: `.next`
- Add all environment variables

### Railway
1. Create new project
2. Connect GitHub repository
3. Add PostgreSQL service
4. Add environment variables
5. Deploy

### DigitalOcean App Platform
1. Create new app
2. Connect GitHub repository
3. Configure build settings
4. Add database component
5. Set environment variables
6. Deploy

## Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] Admin panel accessible at `/admin`
- [ ] Database connected (check if profile page loads)
- [ ] Contact form working (test email sending)
- [ ] Images uploading correctly
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`

## Environment Variables Reference

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | 32+ character random string | Generated in `.env` |
| `PROFESSOR_EMAIL` | Your contact email | `professor@university.edu` |
| `NEXT_PUBLIC_BASE_URL` | Your website URL | `https://yoursite.com` |

### Email (for contact form)
| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password | `your-app-password` |

### Optional Features
| Variable | Description | Where to get |
|----------|-------------|--------------|
| `OPENAI_API_KEY` | AI chatbot | https://platform.openai.com/api-keys |
| `STRIPE_SECRET_KEY` | Payments | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks | Stripe dashboard |
| `ORCID_ID` | Publication sync | Your ORCID profile |
| `NEXT_PUBLIC_TAWKTO_ID` | Live chat | https://tawk.to |

## Gmail SMTP Setup

To use Gmail for contact form emails:

1. Enable 2-Step Verification on your Google account
2. Generate App Password:
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Scroll to "App passwords"
   - Generate password for "Mail"
3. Use generated password in `SMTP_PASS`

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify `DATABASE_URL` is accessible
- Run `npx prisma generate` locally

### Database Connection Error
- Verify connection string format
- Check database accepts external connections
- Ensure IP whitelist includes Vercel IPs

### Images Not Loading
- Check image URLs are HTTPS
- Verify Vercel domain is added to `next.config.mjs`

### Email Not Sending
- Verify SMTP credentials
- Check SMTP port (587 for TLS, 465 for SSL)
- Enable "Less secure app access" if using Gmail

## Performance Optimization

1. **Enable Vercel Analytics:**
   ```bash
   npm install @vercel/analytics
   ```

2. **Configure caching:**
   - Static assets cached automatically
   - Database queries cached via Prisma

3. **Image optimization:**
   - Next.js automatic image optimization
   - Use WebP format when possible

## Security Best Practices

- [ ] Change default admin password immediately
- [ ] Enable 2FA for admin account
- [ ] Keep dependencies updated: `npm update`
- [ ] Use environment variables for all secrets
- [ ] Never commit `.env` file to git
- [ ] Enable CORS only for trusted domains
- [ ] Regular database backups

## Monitoring

- Set up Vercel Analytics for traffic monitoring
- Enable error tracking (Sentry recommended)
- Monitor database performance
- Set up uptime monitoring

## Support

For issues or questions:
- Check Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- Vercel docs: https://vercel.com/docs

## Updating Your Site

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Update database schema if changed
npx prisma db push

# Deploy
git push origin main  # Auto-deploys on Vercel
```
