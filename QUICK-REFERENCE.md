# 🎯 Quick Reference Card

Essential commands and information for your professor website.

## 🚀 Getting Started

```bash
# First time setup
npm install                    # Install dependencies
node setup-wizard.mjs         # Interactive configuration
npx prisma db push            # Set up database
npm run dev                   # Start development

# Visit
http://localhost:3000         # Public site
http://localhost:3000/admin   # Admin panel
```

## 📋 Common Commands

### Development
```bash
npm run dev              # Start dev server (with Turbo)
npm run dev:standard     # Start dev server (standard)
npm run build            # Build for production
npm start                # Run production build
npm run lint             # Run linter
```

### Database
```bash
npx prisma db push           # Push schema to database
npx prisma generate          # Generate Prisma client
npx prisma studio            # Open database GUI
npx prisma migrate deploy    # Deploy migrations (production)
npm run prisma:seed          # Seed database with sample data
```

### Testing & Verification
```bash
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
node verify-setup.mjs    # Verify deployment readiness
```

### Deployment
```bash
# Vercel
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel env pull          # Pull environment variables

# Git
git add .
git commit -m "message"
git push origin main     # Auto-deploys on Vercel
```

## 🔐 Environment Variables

### Required
```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="32-char-random-string"
PROFESSOR_EMAIL="your-email@university.edu"
NEXT_PUBLIC_BASE_URL="https://yoursite.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-password"
```

### Optional
```env
OPENAI_API_KEY=""              # AI chatbot
STRIPE_SECRET_KEY=""           # Payments
ORCID_ID=""                    # Publication sync
NEXT_PUBLIC_TAWKTO_ID=""       # Live chat
```

## 📂 Important Directories

```
├── app/
│   ├── (public)/         # Public pages
│   ├── admin/            # Admin dashboard
│   └── api/              # API routes
├── components/           # React components
├── lib/                  # Utilities
├── prisma/              # Database
│   ├── schema.prisma    # Database schema
│   └── seed.mjs         # Seed data
├── public/              # Static files
└── .env                 # Environment variables
```

## 🔗 Important URLs

### Local Development
- Public Site: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin`
- API Health: `http://localhost:3000/api/health`
- Sitemap: `http://localhost:3000/sitemap.xml`

### Production
- Replace `localhost:3000` with your domain

## 🎨 Admin Panel Quick Guide

### First Login
1. Go to `/admin`
2. Create admin account
3. Enable 2FA (recommended)

### Common Tasks
- **Profile**: `/admin/profile` - Update your info
- **Site Settings**: `/admin/site-settings` - Configure site
- **Publications**: `/admin/publications` - Add research
- **Blog**: `/admin/blog` - Write posts
- **Messages**: `/admin/messages` - View contact forms

## 🔧 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf .next
rm -rf node_modules
npm install
npx prisma generate
npm run build
```

### Database Connection Issues
```bash
# Test connection
npx prisma db pull
# If fails, check DATABASE_URL in .env
```

### Port Already in Use
```bash
# Find and kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### Email Not Sending
1. Check SMTP credentials in `.env`
2. For Gmail, use App Password, not regular password
3. Enable "Less secure app access" if needed
4. Check SMTP_PORT (587 for TLS, 465 for SSL)

### Prisma Client Issues
```bash
npx prisma generate
# If still issues, restart dev server
```

## 📱 Database Quick Reference

### Common Models
- `Profile` - Your personal information
- `Publication` - Research publications
- `ResearchProject` - Research projects
- `Course` - Teaching courses
- `BlogPost` - Blog articles
- `Event` - Events and conferences
- `Student` - Student information
- `AdminUser` - Admin credentials

### Direct Database Access
```bash
npx prisma studio  # Opens GUI at http://localhost:5555
```

## 🛡️ Security Checklist

- [ ] Strong admin password set
- [ ] 2FA enabled
- [ ] `SESSION_SECRET` is random (32+ chars)
- [ ] `.env` not committed to git
- [ ] Database uses SSL in production
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Regular backups configured

## 📊 Performance Tips

### Image Optimization
- Upload images <500KB when possible
- Use WebP format
- Let Next.js handle optimization

### Database
- Use indexes for frequently queried fields
- Paginate large lists
- Cache where appropriate

### Monitoring
- Check Vercel Analytics
- Monitor error logs
- Set up uptime monitoring

## 🆘 Getting Help

### Documentation
- [README.md](./README.md) - Project overview
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Launch checklist

### External Resources
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Vercel: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

### Quick Fixes
```bash
# Reset everything (nuclear option)
rm -rf node_modules .next
npm install
npx prisma generate
npm run dev

# Update all dependencies
npm update

# Check for security issues
npm audit
npm audit fix
```

## 📈 Content Management

### Adding Publications
Admin → Publications → Add New → Fill form → Save

### Writing Blog Posts
Admin → Blog → New Post → Write (Markdown supported) → Publish

### Managing Courses
Admin → Teaching → Courses → Add/Edit courses

### Uploading Files
- Use file upload buttons in admin forms
- Supported: Images (JPG, PNG, WebP), PDFs, Documents

## 🔄 Regular Maintenance

### Weekly
- Check and respond to messages
- Review analytics
- Update content

### Monthly
- `npm update` - Update dependencies
- Review error logs
- Backup database

### Quarterly
- Security audit
- Performance review
- Content audit

---

## 📞 Quick Support

**Issue: Can't access admin**
→ Check `/admin` URL, clear browser cache

**Issue: Changes not showing**
→ Hard refresh (Ctrl+Shift+R) or rebuild

**Issue: Database error**
→ Run `npx prisma generate` and restart server

**Issue: Deployment fails**
→ Check environment variables are set in platform

---

**Print this reference for quick access! 🖨️**
