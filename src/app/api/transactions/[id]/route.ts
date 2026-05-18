import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: (session.user as { id: string }).id },
      { isDeleted: true },
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Transactions delete error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
