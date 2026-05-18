import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <h1 className="text-6xl font-bold tracking-tighter mb-4">BUDGET.</h1>
      <p className="text-xl text-zinc-500 mb-8 max-w-md text-center">
        A minimalist, production-ready budget planning tool for the modern professional.
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline" size="lg">Create Account</Button>
        </Link>
      </div>
    </div>
  );
}
