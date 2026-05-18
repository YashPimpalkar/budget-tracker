import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    // Soft delete all transactions and budgets for this user
    await Transaction.updateMany({ userId }, { isDeleted: true });
    await Budget.updateMany({ userId }, { isDeleted: true });

    return NextResponse.json({ message: 'All data has been reset (soft deleted)' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
