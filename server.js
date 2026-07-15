import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';

const require = createRequire(import.meta.url);
const { connectDB } = require('./backend/config/db.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB Connection (auto fallbacks to local JSON DB if no Mongo URI is provided)
  connectDB();

  // Express Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API Endpoints
  app.use('/api/auth', require('./backend/routes/authRoutes.js'));
  app.use('/api/plans', require('./backend/routes/planRoutes.js'));
  app.use('/api/subscriptions', require('./backend/routes/subscriptionRoutes.js'));
  app.use('/api/payments', require('./backend/routes/paymentRoutes.js'));
  app.use('/api/invoices', require('./backend/routes/invoiceRoutes.js'));
  app.use('/api/coupons', require('./backend/routes/couponRoutes.js'));
  app.use('/api/notifications', require('./backend/routes/notificationRoutes.js'));
  app.use('/api/analytics', require('./backend/routes/analyticsRoutes.js'));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // Serve Frontend with Vite Middleware in Dev, Static in Production
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚡ Mounting Vite Dev Server Middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Serving production static assets from dist/');
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PayTrack Full-Stack server is actively running on http://localhost:${PORT}`);
  });
}

startServer();
