'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DownloadIcon, 
  PieChartIcon, 
  BarChart3Icon, 
  UsersIcon, 
  FileTextIcon, 
  CalendarIcon 
} from 'lucide-react';

// Mock data for demonstration
const trainingProgressData = [
  { name: 'Completed', value: 65, color: 'bg-green-500' },
  { name: 'In Progress', value: 23, color: 'bg-blue-500' },
  { name: 'Not Started', value: 12, color: 'bg-gray-300' },
];

const userCompletionData = [
  { 
    id: 'user1',
    name: 'John Doe',
    department: 'Equipment',
    position: 'Operator',
    modulesCompleted: 5,
    modulesTotal: 7,
    lastActivity: '2023-12-15T10:30:00Z',
    certifications: 2
  },
  { 
    id: 'user2',
    name: 'Jane Smith',
    department: 'Livestock',
    position: 'Caretaker',
    modulesCompleted: 8,
    modulesTotal: 10,
    lastActivity: '2023-12-18T14:45:00Z',
    certifications: 3
  },
  { 
    id: 'user3',
    name: 'Robert Johnson',
    department: 'Crops',
    position: 'Field Manager',
    modulesCompleted: 3,
    modulesTotal: 12,
    lastActivity: '2023-12-10T09:15:00Z',
    certifications: 1
  },
  { 
    id: 'user4',
    name: 'Sarah Williams',
    department: 'Management',
    position: 'Farm Supervisor',
    modulesCompleted: 12,
    modulesTotal: 12,
    lastActivity: '2023-12-20T11:20:00Z',
    certifications: 5
  },
];

const moduleCompletionData = [
  {
    id: 'mod1',
    title: 'Farm Equipment Safety',
    category: 'Safety',
    usersCompleted: 8,
    usersTotal: 12,
    avgCompletionTime: 45, // in minutes
    avgScore: 85 // percentage
  },
  {
    id: 'mod2',
    title: 'Livestock Care Basics',
    category: 'Animal Husbandry',
    usersCompleted: 6,
    usersTotal: 12,
    avgCompletionTime: 60,
    avgScore: 78
  },
  {
    id: 'mod3',
    title: 'Pest Control Techniques',
    category: 'Crop Management',
    usersCompleted: 4,
    usersTotal: 12,
    avgCompletionTime: 90,
    avgScore: 72
  },
  {
    id: 'mod4',
    title: 'Irrigation Systems',
    category: 'Infrastructure',
    usersCompleted: 10,
    usersTotal: 12,
    avgCompletionTime: 30,
    avgScore: 92
  },
];

const departmentProgressData = [
  { name: 'Equipment', completed: 78, total: 100 },
  { name: 'Livestock', completed: 65, total: 100 },
  { name: 'Crops', completed: 42, total: 100 },
  { name: 'Management', completed: 93, total: 100 },
];

const monthlyActivityData = [
  { month: 'Jan', completions: 12, certifications: 5 },
  { month: 'Feb', completions: 15, certifications: 7 },
  { month: 'Mar', completions: 18, certifications: 8 },
  { month: 'Apr', completions: 14, certifications: 6 },
  { month: 'May', completions: 20, certifications: 9 },
  { month: 'Jun', completions: 25, certifications: 12 },
  { month: 'Jul', completions: 22, certifications: 10 },
  { month: 'Aug', completions: 28, certifications: 15 },
  { month: 'Sep', completions: 30, certifications: 18 },
  { month: 'Oct', completions: 35, certifications: 20 },
  { month: 'Nov', completions: 32, certifications: 17 },
  { month: 'Dec', completions: 28, certifications: 14 },
];

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('year');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Check if the user is admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin' && session?.user?.email !== 'john@snydersfarm.com') {
      // Redirect non-admin users to the dashboard
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [status, session, router]);
  
  // Simulate loading data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [status, session]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate completion percentage
  const calculatePercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };
  
  // Convert minutes to hours and minutes format
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  // Export reports data
  const exportReport = (reportType: string) => {
    // In a real implementation, this would call an API to generate and download reports
    console.log(`Exporting ${reportType} report...`);
    
    // Simulate download delay
    setTimeout(() => {
      alert(`${reportType} report exported successfully!`);
    }, 1000);
  };
  
  // Generate simple bar chart using divs
  const SimpleBarChart = ({ data, maxValue }: { data: any[], maxValue: number }) => {
    return (
      <div className="w-full mt-4">
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-20 text-sm text-gray-500">{item.month}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${(item.completions / maxValue) * 100}%` }}
                ></div>
              </div>
              <div className="w-10 text-sm text-right">{item.completions}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Show loading state while checking auth or loading data
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Training Reports</h1>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => exportReport('Excel')}
            className="flex items-center"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export as Excel
          </Button>
          <Button 
            variant="outline"
            onClick={() => exportReport('PDF')}
            className="flex items-center"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
          <Link href="/admin">
            <Button variant="outline">Back to Admin Dashboard</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{userCompletionData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <FileTextIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Training Modules</p>
                <p className="text-2xl font-bold">{moduleCompletionData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <BarChart3Icon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">68%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active This Month</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Monthly Training Activity</CardTitle>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>Number of module completions per month</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={monthlyActivityData} 
              maxValue={Math.max(...monthlyActivityData.map(d => d.completions))} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>Overall completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <div className="grid grid-cols-1 gap-4 w-full">
                {trainingProgressData.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${item.color} h-2.5 rounded-full`} 
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users" className="mb-6">
        <TabsList>
          <TabsTrigger value="users">User Completion</TabsTrigger>
          <TabsTrigger value="modules">Module Analytics</TabsTrigger>
          <TabsTrigger value="departments">Department Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Training Progress</CardTitle>
              <CardDescription>Training completion by user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Modules Progress</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Certifications</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userCompletionData.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          {user.department} - {user.position}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={calculatePercentage(user.modulesCompleted, user.modulesTotal)} className="h-2 w-32" />
                            <span className="text-xs text-gray-500">
                              {user.modulesCompleted}/{user.modulesTotal}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            user.modulesCompleted === user.modulesTotal
                              ? "bg-green-100 text-green-800"
                              : user.modulesCompleted > 0
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }>
                            {user.modulesCompleted === user.modulesTotal
                              ? "Completed"
                              : user.modulesCompleted > 0
                                ? "In Progress"
                                : "Not Started"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.certifications}</TableCell>
                        <TableCell>{formatDate(user.lastActivity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Completion Analytics</CardTitle>
              <CardDescription>Performance metrics by training module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Users Completed</TableHead>
                      <TableHead>Avg. Completion Time</TableHead>
                      <TableHead>Avg. Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moduleCompletionData.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">{module.title}</TableCell>
                        <TableCell>{module.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={calculatePercentage(module.usersCompleted, module.usersTotal)} 
                              className="h-2 w-32" 
                            />
                            <span className="text-xs text-gray-500">
                              {calculatePercentage(module.usersCompleted, module.usersTotal)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {module.usersCompleted}/{module.usersTotal} users
                        </TableCell>
                        <TableCell>{formatTime(module.avgCompletionTime)}</TableCell>
                        <TableCell>
                          <Badge className={
                            module.avgScore >= 90
                              ? "bg-green-100 text-green-800"
                              : module.avgScore >= 70
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                          }>
                            {module.avgScore}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Department Progress</CardTitle>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Livestock">Livestock</SelectItem>
                    <SelectItem value="Crops">Crops</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>Training completion by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {departmentProgressData
                  .filter(dept => departmentFilter === 'all' || dept.name === departmentFilter)
                  .map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{dept.name}</h3>
                        <p className="text-sm text-gray-500">
                          {calculatePercentage(dept.completed, dept.total)}% complete
                        </p>
                      </div>
                      <Badge className={
                        calculatePercentage(dept.completed, dept.total) >= 90
                          ? "bg-green-100 text-green-800" 
                          : calculatePercentage(dept.completed, dept.total) >= 60
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }>
                        {calculatePercentage(dept.completed, dept.total)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={calculatePercentage(dept.completed, dept.total)}
                      className="h-2" 
                    />
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Users</p>
                        <p className="font-medium">
                          {departmentFilter === 'all' 
                            ? userCompletionData.filter(u => u.department === dept.name).length
                            : userCompletionData.filter(u => u.department === dept.name).length}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Modules</p>
                        <p className="font-medium">
                          {moduleCompletionData.length}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Certifications</p>
                        <p className="font-medium">
                          {userCompletionData
                            .filter(u => departmentFilter === 'all' || u.department === dept.name)
                            .reduce((sum, user) => sum + user.certifications, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 