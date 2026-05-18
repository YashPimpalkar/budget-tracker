import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const userId = new mongoose.Types.ObjectId((session.user as { id: string }).id);

    // Get all budgets for the user for this month
    const budgets = await Budget.find({ userId, month, year, isDeleted: false });

    // Get spending for each category
    const spending = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          isDeleted: false,
          date: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1),
          },
        },
      },
      {
        $group: {
          _id: { $toLower: '$category' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const result = budgets.map((b) => {
      const categorySpending = spending.find((s) => s._id === b.category.toLowerCase())?.total || 0;
      return {
        _id: b._id,
        category: b.category,
        limit: b.limit,
        spent: categorySpending,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Budgets GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, category, limit, month, year } = await req.json();

    if (!category || limit === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    let budget;
    if (id) {
      budget = await Budget.findOneAndUpdate(
        { _id: id, userId: (session.user as { id: string }).id },
        { category, limit, isDeleted: false },
        { new: true }
      );
    } else {
      budget = await Budget.findOneAndUpdate(
        {
          userId: (session.user as { id: string }).id,
          category,
          month: month || new Date().getMonth() + 1,
          year: year || new Date().getFullYear(),
        },
        { limit, isDeleted: false },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Budgets POST error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing budget ID' }, { status: 400 });
    }

    await connectDB();
    await Budget.findOneAndUpdate(
      { _id: id, userId: (session.user as { id: string }).id },
      { isDeleted: true }
    );

    return NextResponse.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Budgets DELETE error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
