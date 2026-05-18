import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';

/**
 * POST /api/budgets/auto-reset
 *
 * Idempotently copies last month's budget categories + limits into the
 * current month for the authenticated user, but only if the current month
 * has no budget entries yet. Safe to call multiple times — it's a no-op
 * if the current month already has budgets.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-based
    const currentYear = now.getFullYear();

    const userId = (session.user as any).id;

    // Check if current month already has budgets — if yes, nothing to do
    const existing = await Budget.countDocuments({
      userId,
      month: currentMonth,
      year: currentYear,
      isDeleted: false,
    });

    if (existing > 0) {
      return NextResponse.json({ message: 'Already initialised', copied: 0 });
    }

    // Calculate last month
    const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastYear = lastMonthDate.getFullYear();

    const previousBudgets = await Budget.find({
      userId,
      month: lastMonth,
      year: lastYear,
      isDeleted: false,
    });

    if (previousBudgets.length === 0) {
      return NextResponse.json({ message: 'No previous budgets to copy', copied: 0 });
    }

    // Bulk-insert new budgets for current month (one per previous category)
    const newBudgets = previousBudgets.map((b) => ({
      userId,
      category: b.category,
      limit: b.limit,
      month: currentMonth,
      year: currentYear,
      isDeleted: false,
    }));

    await Budget.insertMany(newBudgets, { ordered: false });

    return NextResponse.json({
      message: 'Budgets reset for new month',
      copied: newBudgets.length,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
