import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();
    
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Yash##786';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    });
    
    return NextResponse.json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Error seeding admin:', error);
    return NextResponse.json({ message: 'Error seeding admin' }, { status: 500 });
  }
}
