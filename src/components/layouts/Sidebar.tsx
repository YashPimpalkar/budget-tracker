import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Target, Settings, LogOut, X, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { signOut, useSession } from 'next-auth/react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ReceiptText, label: 'Transactions', href: '/dashboard/transactions' },
  { icon: Target, label: 'Budgets', href: '/dashboard/budgets' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: ShieldAlert, label: 'Admin Recovery', href: '/dashboard/admin', role: 'ADMIN' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const dispatch = useAppDispatch();

  const filteredItems = menuItems.filter(item => !item.role || (session?.user as any)?.role === item.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transition-transform duration-300 ease-in-out dark:bg-background dark:border-zinc-800 lg:translate-x-0",
          !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xl font-bold tracking-tight dark:text-white dark:glow-text-cyan">BUDGET.</span>
            <button className="lg:hidden dark:text-white" onClick={() => dispatch(toggleSidebar())}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-black text-white dark:bg-primary dark:text-primary-foreground dark:glow-box"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                )}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
