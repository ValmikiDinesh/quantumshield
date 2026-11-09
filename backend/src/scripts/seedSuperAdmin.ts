import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { SuperAdmin } from '../models/SuperAdmin';
import { env } from '../config/env';

async function seedAdmin() {
  const args = process.argv.slice(2);
  const getArg = (key: string, fallback: string): string => {
    const idx = args.indexOf(`--${key}`);
    if (idx !== -1 && args[idx + 1]) {
      return args[idx + 1];
    }
    return fallback;
  };

  const email = getArg('email', 'admin@valmikisoftwares.com').toLowerCase().trim();
  const passwordPlain = getArg('password', 'QuantumShield@SuperAdmin2026!');
  const name = getArg('name', 'Valmiki Super Admin');
  const role = getArg('role', 'superadmin');

  console.log(`[SeedAdmin] Connecting to MongoDB: ${env.MONGODB_URI}`);
  await mongoose.connect(env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(passwordPlain, 12);

  const existing = await SuperAdmin.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.role = role as any;
    existing.isActive = true;
    await existing.save();
    console.log(`[SeedAdmin] ✓ Successfully updated existing SuperAdmin: ${email}`);
  } else {
    await SuperAdmin.create({
      name,
      email,
      passwordHash,
      role,
      isActive: true,
    });
    console.log(`[SeedAdmin] ✓ Successfully created new SuperAdmin: ${email}`);
  }

  console.log('----------------------------------------------------');
  console.log(`Email:    ${email}`);
  console.log(`Role:     ${role}`);
  console.log(`Status:   ACTIVE`);
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('[SeedAdmin] ✗ Failed to seed super admin:', err);
  process.exit(1);
});
