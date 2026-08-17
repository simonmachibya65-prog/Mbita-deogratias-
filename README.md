# Mbita Emmanuel — Personal Website

A full-featured professor personal website built with Next.js 14, Prisma, and PostgreSQL.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/professor-website)

## ✨ Features

### Public Website
- 🏠 Home page with hero section, stats, announcements
- 👤 About page with bio, education, experience
- 🔬 Research projects and publications
- 📚 Teaching courses and materials
- 📝 Blog with markdown support
- 📅 Events calendar
- 🖼️ Gallery
- 📧 Contact form
- 👨‍🎓 Student portal with dashboard

### Admin Dashboard
- 📊 Full CRUD for all content
- 📈 Analytics and insights
- 🔐 Secure authentication with 2FA
- 📱 Responsive admin interface
- 🎨 Site customization controls
- 📧 Message management

### Advanced Features
- 🤖 AI chatbot assistant (OpenAI)
- 💳 Marketplace with Stripe integration
- 🔄 Auto-sync with ORCID, Google Scholar
- 📊 Impact dashboard and metrics
- 🎓 LMS: attendance, grades, assignments
- 🤝 Research collaboration network
- 📅 Appointment scheduling
- 🎥 Video lecture library
- 👥 Alumni network
- 💰 Grant funding tracker

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **Auth**: iron-session + bcryptjs
- **Payments**: Stripe
- **AI**: OpenAI
- **Real-time**: Socket.io
- **Charts**: Chart.js, Recharts
- **Testing**: Jest + React Testing Library

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. **Clone and install:**
```bash
git clone <your-repo-url>
cd professor-website
npm install
```

2. **Set up environment:**
```bash
# .env file is already created with secure defaults
# Update DATABASE_URL and email settings
```

3. **Initialize database:**
```bash
npx prisma db push
```

4. **Start development:**
```bash
npm run dev
```

Visit http://localhost:3000

**📖 For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md)**

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/professor-website)

**📖 For detailed deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## ✅ Verify Setup

Run the verification script to check if everything is configured correctly:

```bash
node verify-setup.mjs
```

## 🔐 Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random string (32+ chars) ✅ Already generated
- `PROFESSOR_EMAIL` - Your email
- `NEXT_PUBLIC_BASE_URL` - Your site URL
- `SMTP_*` - Email configuration

### Optional
- `OPENAI_API_KEY` - For AI chatbot
- `STRIPE_SECRET_KEY` - For payments
- `ORCID_ID` - For publication sync
- `NEXT_PUBLIC_TAWKTO_ID` - For live chat

See `.env.example` for complete list.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[.env.example](./.env.example)** - Environment variables reference
- **[.env.production.example](./.env.production.example)** - Production config template

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## 📁 Project Structure

```
professor-website/
├── app/                    # Next.js app directory
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Database schema & migrations
│   ├── schema.prisma
│   └── seed.mjs
├── public/                # Static assets
├── .env                   # Environment variables (✅ created)
├── .env.example           # Environment template
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
├── QUICKSTART.md          # Quick setup guide
├── DEPLOYMENT.md          # Deployment guide
└── verify-setup.mjs       # Setup verification script
```

## 🔒 Security

- Session-based authentication with iron-session
- Password hashing with bcryptjs
- Two-factor authentication (TOTP)
- Rate limiting on login attempts
- Environment variable validation
- HTTPS enforced in production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check [QUICKSTART.md](./QUICKSTART.md) for common issues
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review [Next.js docs](https://nextjs.org/docs)
- Review [Prisma docs](https://www.prisma.io/docs)

## ✨ Status

- ✅ Dependencies installed
- ✅ Environment configured
- ✅ Prisma schema ready
- ✅ Deployment guides created
- ⚠️ Database needs setup
- ⚠️ Email SMTP needs configuration

Run `node verify-setup.mjs` for complete status check.
