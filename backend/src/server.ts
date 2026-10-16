import dns from 'dns';
import app from './app';
import { env } from './config/env';
import { connectDB } from './db/connection';

// Force IPv4 DNS resolution first to prevent ENETUNREACH on cloud containers without IPv6 routes (Render, AWS)
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

async function bootstrap() {
  try {
    await connectDB();
    const port = parseInt(env.PORT, 10) || 5001;

    app.listen(port, () => {
      console.log('=====================================================');
      console.log(`🛡️  QuantumShield Backend API Server Running`);
      console.log(`🏢  Developed by Valmiki Softwares`);
      console.log(`🚀  Port: ${port}`);
      console.log(`🌐  Health Endpoint: http://localhost:${port}/api/health`);
      console.log(`📜  OpenAPI Spec:    http://localhost:${port}/api/docs/openapi.json`);
      console.log(`⚙️   Environment:     ${env.NODE_ENV}`);
      console.log('=====================================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
