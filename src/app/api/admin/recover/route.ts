import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Budget from '@/models/Budget';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const minAmount = parseFloat(searchParams.get('minAmount') || '0');
    const maxAmount = parseFloat(searchParams.get('maxAmount') || '1000000000');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filter by email if provided (requires finding user first or using aggregation)
    let userFilter: any = {};
    if (email) {
      const user = await User.findOne({ email: { $regex: email, $options: 'i' } });
      if (user) {
        userFilter.userId = user._id;
      } else {
        // If email provided but user not found, return empty
        return NextResponse.json({ transactions: [], budgets: [], pagination: { total: 0, page, limit, pages: 0 } });
      }
    }

    const txQuery = { ...userFilter, isDeleted: true, amount: { $gte: minAmount, $lte: maxAmount } };
    const budgetQuery = { ...userFilter, isDeleted: true }; // Budget doesn't have "amount", it has "limit"

    const [transactions, totalTx] = await Promise.all([
      Transaction.find(txQuery).populate('userId', 'name email').sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(txQuery),
    ]);

    const budgets = await Budget.find(budgetQuery).populate('userId', 'name email').sort({ updatedAt: -1 });

    return NextResponse.json({
      transactions,
      budgets,
      pagination: {
        total: totalTx,
        page,
        limit,
        pages: Math.ceil(totalTx / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { type, id } = await req.json();

    if (!type || !id) {
      return NextResponse.json({ message: 'Missing type or id' }, { status: 400 });
    }

    await connectDB();

    if (type === 'transaction') {
      await Transaction.findByIdAndUpdate(id, { isDeleted: false });
    } else if (type === 'budget') {
      await Budget.findByIdAndUpdate(id, { isDeleted: false });
    } else {
      return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Item recovered successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
