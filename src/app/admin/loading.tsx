import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="mb-3 h-4 w-28" />
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-6 h-[min(24rem,50vh)] w-full rounded-md" />
      </Card>
    </div>
  );
}
