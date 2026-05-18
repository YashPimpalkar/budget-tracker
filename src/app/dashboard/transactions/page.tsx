import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight dark:text-white dark:glow-text-cyan">Transactions</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your income and expenses.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TransactionForm />
        <TransactionList />
      </div>
    </div>
  );
}
