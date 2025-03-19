import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, BookOpen, Calendar, Clock, Users } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Farm Training Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          icon={<BookOpen className="h-8 w-8 text-blue-500" />}
          title="Training Modules" 
          value="24" 
          description="Available modules" 
          color="blue"
        />
        <DashboardCard 
          icon={<Clock className="h-8 w-8 text-green-500" />}
          title="Learning Hours" 
          value="12.5" 
          description="Hours completed" 
          color="green"
        />
        <DashboardCard 
          icon={<Users className="h-8 w-8 text-purple-500" />}
          title="Team Members" 
          value="8" 
          description="Active learners" 
          color="purple"
        />
        <DashboardCard 
          icon={<Calendar className="h-8 w-8 text-amber-500" />}
          title="Upcoming Sessions" 
          value="3" 
          description="Scheduled events" 
          color="amber"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Progress</CardTitle>
              <CardDescription>Track your progress across all modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Farm Equipment Safety</span>
                    <span className="text-sm text-gray-500">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Crop Rotation Techniques</span>
                    <span className="text-sm text-gray-500">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Livestock Management</span>
                    <span className="text-sm text-gray-500">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/modules">
                <Button variant="outline">
                  View All Modules
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Completed "Introduction to Farm Equipment Safety"</p>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <BookOpen className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Started "Tractor Operation Safety"</p>
                    <p className="text-sm text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-4">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Completed "Tractor Operation Safety"</p>
                    <p className="text-sm text-gray-500">Today</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Modules</CardTitle>
              <CardDescription>Based on your interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/modules/3" className="block">
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium">Livestock Management</h4>
                      <p className="text-sm text-gray-500">10 lessons • 4 hours</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/modules/4" className="block">
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium">Sustainable Farming Practices</h4>
                      <p className="text-sm text-gray-500">7 lessons • 3 hours</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/modules/6" className="block">
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium">Irrigation Systems</h4>
                      <p className="text-sm text-gray-500">6 lessons • 2.5 hours</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/modules" className="w-full">
                <Button variant="outline" className="w-full">
                  Browse All Modules
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Scheduled training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Equipment Maintenance Workshop</p>
                  <p className="text-sm text-gray-500">May 15, 2023 • 10:00 AM</p>
                </div>
                <div>
                  <p className="font-medium">Crop Planning Seminar</p>
                  <p className="text-sm text-gray-500">May 22, 2023 • 2:00 PM</p>
                </div>
                <div>
                  <p className="font-medium">Livestock Health Webinar</p>
                  <p className="text-sm text-gray-500">June 5, 2023 • 1:00 PM</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Calendar</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
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
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div>
            {icon}
          </div>
          <div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}