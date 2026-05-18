import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Ensure existing user has ADMIN role
      existingAdmin.role = 'ADMIN';
      await existingAdmin.save();
      return NextResponse.json({ message: 'Admin already exists and was updated to ADMIN role' });
    }

    const hashedPassword = await bcrypt.hash('Yash##786', 12);
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    });

    return NextResponse.json({ message: 'Admin user seeded successfully' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
