require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.profile.count()
  .then(c => { console.log('Connected! Profile count:', c); return p.$disconnect(); })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
