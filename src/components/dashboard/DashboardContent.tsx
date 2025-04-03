'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Define SVG icon components to replace lucide-react
const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function UserRoleDebug() {
  const { currentUser, isAdmin, isManager } = useAuth();
  
  return (
    <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded">
      <p>User: {currentUser?.email}</p>
      <p>Role: {isAdmin ? 'Admin' : isManager ? 'Manager' : 'User'}</p>
      <p>Email verified: {currentUser?.emailVerified ? 'Yes' : 'No'}</p>
    </div>
  );
}

function DashboardCard({ 
  icon,
  title, 
  value, 
  description,
  color
}: { 
  icon: React.ReactNode;
  title: string; 
  value: string; 
  description: string;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const { reloadUser } = useAuth();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');
  
  // If user is coming back from email verification
  useEffect(() => {
    if (verified === 'true') {
      const checkVerification = async () => {
        await reloadUser();
        toast({
          title: "Email verification",
          description: "Thank you for verifying your email address.",
          variant: "default",
        });
      };
      
      checkVerification();
    }
  }, [verified, reloadUser]);
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Farm Training Dashboard</h1>
        
        {/* Email Verification Banner */}
        <EmailVerificationBanner />
        
        {/* Debug User Role */}
        <UserRoleDebug />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            icon={<BookOpenIcon className="h-4 w-4 text-white" />}
            title="Total Modules"
            value="12"
            description="Available training modules"
            color="bg-blue-500"
          />
          <DashboardCard 
            icon={<ClockIcon className="h-4 w-4 text-white" />}
            title="Time Spent"
            value="4.5 hrs"
            description="Total training time"
            color="bg-green-500"
          />
          <DashboardCard 
            icon={<UsersIcon className="h-4 w-4 text-white" />}
            title="Team Members"
            value="8"
            description="Active team members"
            color="bg-purple-500"
          />
          <DashboardCard 
            icon={<CalendarIcon className="h-4 w-4 text-white" />}
            title="Next Deadline"
            value="Mar 15"
            description="Safety certification due"
            color="bg-orange-500"
          />
        </div>
        
        {/* Rest of your dashboard content */}
      </div>
    </ProtectedRoute>
  );
} 