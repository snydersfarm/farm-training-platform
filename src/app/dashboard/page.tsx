import { Suspense } from 'react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>}>
      <DashboardContent />
    </Suspense>
  );
}