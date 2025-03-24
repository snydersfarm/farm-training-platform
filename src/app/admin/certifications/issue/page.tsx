'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, CheckIcon, ChevronLeftIcon } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

interface Module {
  id: string;
  title: string;
  category: {
    name: string;
  } | null;
}

export default function IssueCertification() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [certName, setCertName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [issuedDate, setIssuedDate] = useState<Date>(new Date());
  const [neverExpires, setNeverExpires] = useState<boolean>(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Calculate default expiry date (1 year from today)
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    setExpiryDate(defaultDate);
  }, []);
  
  // Check if the user is admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      // Redirect non-admin users to the dashboard
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [status, session, router]);
  
  // Fetch users and modules when authenticated as admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchUsersAndModules();
    }
  }, [status, session]);
  
  const fetchUsersAndModules = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockUsers = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@farmtraining.com',
          department: 'Equipment',
          position: 'Operator'
        },
        {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@farmtraining.com',
          department: 'Livestock',
          position: 'Caretaker'
        },
        {
          id: 'user3',
          name: 'Robert Johnson',
          email: 'robert@farmtraining.com',
          department: 'Crops',
          position: 'Field Manager'
        },
        {
          id: 'user4',
          name: 'Sarah Williams',
          email: 'sarah@farmtraining.com',
          department: 'Management',
          position: 'Farm Supervisor'
        }
      ];
      
      const mockModules = [
        {
          id: 'mod1',
          title: 'Farm Equipment Safety',
          category: {
            name: 'Safety'
          }
        },
        {
          id: 'mod2',
          title: 'Livestock Care Basics',
          category: {
            name: 'Animal Husbandry'
          }
        },
        {
          id: 'mod3',
          title: 'Pest Control Techniques',
          category: {
            name: 'Crop Management'
          }
        },
        {
          id: 'mod4',
          title: 'Irrigation Systems',
          category: {
            name: 'Infrastructure'
          }
        }
      ];
      
      // In a real implementation, this would be:
      // const usersResponse = await fetch('/api/users');
      // const modulesResponse = await fetch('/api/modules');
      // if (!usersResponse.ok || !modulesResponse.ok) {
      //   throw new Error('Failed to fetch data');
      // }
      // const usersData = await usersResponse.json();
      // const modulesData = await modulesResponse.json();
      // setUsers(usersData.data);
      // setModules(modulesData.data);
      
      setUsers(mockUsers);
      setModules(mockModules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUserChange = (value: string) => {
    setSelectedUser(value);
  };
  
  const handleModuleChange = (value: string) => {
    setSelectedModule(value);
    
    // Auto-populate certificate name based on module
    const selectedMod = modules.find(m => m.id === value);
    if (selectedMod) {
      setCertName(`${selectedMod.title} Certification`);
      setDescription(`This certifies that the user has completed the ${selectedMod.title} module and demonstrated proficiency in all required skills.`);
    }
  };
  
  const handleNeverExpiresChange = (checked: boolean) => {
    setNeverExpires(checked);
    if (checked) {
      setExpiryDate(undefined);
    } else {
      // Reset to 1 year from today
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      setExpiryDate(defaultDate);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedModule || !certName) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, this would be an API call:
      // const response = await fetch('/api/admin/certifications', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     userId: selectedUser,
      //     moduleId: selectedModule,
      //     name: certName,
      //     description,
      //     issuedAt: issuedDate.toISOString(),
      //     expiresAt: neverExpires ? null : expiryDate?.toISOString(),
      //   }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to issue certificate');
      // }
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to certifications page
      router.push('/admin/certifications');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while issuing the certificate');
      console.error('Error submitting form:', err);
      setIsSubmitting(false);
    }
  };
  
  // Show loading state while checking auth or loading data
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/certifications">
          <Button variant="ghost" className="mr-4 p-0 h-8 w-8">
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Issue New Certificate</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
          <CardDescription>Create a new certificate for a user who has completed a training module</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user">User <span className="text-red-500">*</span></Label>
                <Select value={selectedUser} onValueChange={handleUserChange}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="module">Training Module <span className="text-red-500">*</span></Label>
                <Select value={selectedModule} onValueChange={handleModuleChange}>
                  <SelectTrigger id="module">
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map(module => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                        {module.category && ` (${module.category.name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="certName">Certificate Name <span className="text-red-500">*</span></Label>
                <Input
                  id="certName"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="e.g. Farm Equipment Operation Certification"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issued-date">Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issuedDate ? format(issuedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={issuedDate}
                      onSelect={(date) => date && setIssuedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="expiry-date">Expiration Date</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="never-expires"
                      checked={neverExpires}
                      onCheckedChange={handleNeverExpiresChange}
                    />
                    <label
                      htmlFor="never-expires"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Never expires
                    </label>
                  </div>
                </div>
                
                {!neverExpires && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={(date) => date && setExpiryDate(date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Certificate Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
                placeholder="Describe what this certification represents..."
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/admin/certifications">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Issuing...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Issue Certificate
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 