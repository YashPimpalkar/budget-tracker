'use client';

import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/uiSlice';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { userService } from '@/services/userService';

export default function SettingsPage() {
  const { data: session } = useSession();
  const theme = useAppSelector((state) => state.ui.theme);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [name, setName] = useState(session?.user?.name || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Profile updated successfully (Simulated)');
      setLoading(false);
    }, 1000);
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to delete all your transactions and budgets? This action cannot be undone.')) {
      return;
    }

    setResetLoading(true);
    try {
      await userService.resetUserData();
      toast.success('All data has been reset');
    } catch (error) {
      console.error('Settings reset error:', error);
      toast.error('An error occurred');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight dark:text-white dark:glow-text-cyan">Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your account preferences and profile.</p>
      </div>

      <div className="grid gap-6">
        <Card className="dark:glow-border-cyan">
          <CardHeader>
            <CardTitle className="dark:text-white">Profile Information</CardTitle>
            <CardDescription className="dark:text-zinc-400">Update your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-zinc-200">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="dark:bg-zinc-900/50 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-zinc-200">Email Address</label>
                <Input
                  value={session?.user?.email || ''}
                  disabled
                  className="bg-zinc-50 dark:bg-zinc-900/80 cursor-not-allowed dark:border-zinc-800"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Email cannot be changed.</p>
              </div>
              <Button type="submit" disabled={loading} className="dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="dark:glow-border-cyan">
          <CardHeader>
            <CardTitle className="dark:text-white">Appearance</CardTitle>
            <CardDescription className="dark:text-zinc-400">Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium dark:text-zinc-200">Dark Mode</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Switch between light and dark themes.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(toggleTheme())}
                className="gap-2 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'light' ? 'Dark' : 'Light'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900/50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
            <CardDescription className="dark:text-zinc-400">Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium dark:text-zinc-200">Reset Data</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Delete all transactions and budgets.</p>
              </div>
              <Button
                variant="outline"
                onClick={handleResetData}
                disabled={resetLoading}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-500 dark:hover:bg-red-950"
              >
                {resetLoading ? 'Resetting...' : 'Reset All Data'}
              </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="space-y-0.5">
                <p className="text-sm font-medium dark:text-zinc-200">Delete Account</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Permanently remove your account.</p>
              </div>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-500 dark:hover:bg-red-950">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
