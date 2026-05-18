import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ title, value, description, icon, className }: StatsCardProps) {
  return (
    <Card className={cn("dark:glow-border-white", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium tracking-tight text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          {icon && <div className="text-zinc-500 dark:text-white">{icon}</div>}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight dark:text-white dark:glow-text-white">{value}</span>
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
