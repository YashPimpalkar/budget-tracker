import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'monthly';
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId((session.user as any).id);

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (type === 'monthly') {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else if (type === 'yearly') {
      // From 1st of same month previous year to end of selected month
      startDate = new Date(year - 1, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else if (type === 'total' && from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
    }

    const getStats = async (start?: Date, end?: Date) => {
      const match: any = { userId, isDeleted: false };
      if (start || end) {
        match.date = {};
        if (start) match.date.$gte = start;
        if (end) match.date.$lte = end;
      }

      const result = await Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]);

      const income = result.find((s) => s._id === 'income')?.total || 0;
      const expenses = result.find((s) => s._id === 'expense')?.total || 0;
      return { income, expenses, balance: income - expenses };
    };

    const [stats, recentTransactions] = await Promise.all([
      getStats(startDate, endDate),
      Transaction.find({ 
        userId, 
        isDeleted: false,
        ...(startDate || endDate ? {
          date: {
            ...(startDate ? { $gte: startDate } : {}),
            ...(endDate ? { $lte: endDate } : {}),
          }
        } : {})
      }).sort({ date: -1 }).limit(5),
    ]);

    return NextResponse.json({
      stats,
      recentTransactions,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
