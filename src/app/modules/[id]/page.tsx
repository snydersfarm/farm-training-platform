import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Define SVG icon components to replace lucide-react imports
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const AwardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
)

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
)

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

// This would come from your database in a real implementation
const trainingModules = [
  {
    id: 1,
    title: 'Farm Equipment Safety',
    description: 'Learn essential safety protocols for operating farm equipment and machinery.',
    duration: '2 hours',
    lessonCount: 5,
    level: 'Beginner',
    category: 'Safety',
    image: '/placeholder.svg?height=400&width=800',
    progress: 40,
    overview: 'This comprehensive module covers all aspects of farm equipment safety. You will learn how to operate tractors, harvesters, and other machinery safely, understand maintenance procedures, and recognize potential hazards. By the end of this module, you will be able to confidently operate farm equipment while minimizing risks to yourself and others.',
    lessons: [
      { id: 1, title: 'Introduction to Farm Equipment Safety', duration: '15 min', completed: true },
      { id: 2, title: 'Tractor Operation Safety', duration: '30 min', completed: true },
      { id: 3, title: 'Harvesting Equipment Guidelines', duration: '25 min', completed: false },
      { id: 4, title: 'Maintenance and Inspection Protocols', duration: '30 min', completed: false },
      { id: 5, title: 'Emergency Procedures and First Aid', duration: '20 min', completed: false }
    ],
    resources: [
      { id: 1, title: 'Equipment Safety Checklist', type: 'PDF' },
      { id: 2, title: 'Maintenance Schedule Template', type: 'Spreadsheet' },
      { id: 3, title: 'Safety Regulations Handbook', type: 'PDF' }
    ],
    instructor: {
      name: 'John Deere',
      role: 'Farm Safety Specialist',
      bio: '15+ years of experience in agricultural safety training',
      avatar: '/placeholder.svg?height=100&width=100'
    }
  },
  {
    id: 2,
    title: 'Crop Rotation Techniques',
    description: 'Master the art of crop rotation to improve soil health and increase yields.',
    duration: '3 hours',
    lessons: 8,
    level: 'Intermediate',
    category: 'Crops',
    image: '/placeholder.svg?height=400&width=800',
    progress: 0,
    overview: 'This module explores the principles and practices of effective crop rotation. You will learn how different crop families affect soil nutrients, how to plan rotation cycles, and strategies to maximize yield while minimizing pest and disease pressure. This knowledge will help you implement sustainable farming practices that improve your land over time.',
    lessons: [
      { id: 1, title: 'Principles of Crop Rotation', duration: '20 min', completed: false },
      { id: 2, title: 'Understanding Plant Families', duration: '25 min', completed: false },
      { id: 3, title: 'Soil Nutrient Management', duration: '30 min', completed: false },
      { id: 4, title: 'Planning Rotation Cycles', duration: '35 min', completed: false },
      { id: 5, title: 'Pest and Disease Management', duration: '25 min', completed: false },
      { id: 6, title: 'Cover Crops in Rotation', duration: '20 min', completed: false },
      { id: 7, title: 'Case Studies: Successful Rotations', duration: '15 min', completed: false },
      { id: 8, title: 'Creating Your Rotation Plan', duration: '30 min', completed: false }
    ],
    resources: [
      { id: 1, title: 'Crop Family Chart', type: 'PDF' },
      { id: 2, title: 'Rotation Planning Template', type: 'Spreadsheet' },
      { id: 3, title: 'Soil Testing Guide', type: 'PDF' }
    ],
    instructor: {
      name: 'Maria Fields',
      role: 'Sustainable Agriculture Expert',
      bio: 'Certified crop advisor with 12 years of experience in organic farming',
      avatar: '/placeholder.svg?height=100&width=100'
    }
  }
]

// Correctly type the params for Next.js App Router
interface ModuleDetailPageProps {
  params: {
    id: string
  }
}

export default function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const moduleId = Number.parseInt(params.id, 10)
  const module = trainingModules.find(m => m.id === moduleId)
  
  if (!module) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/modules">
          <Button variant="ghost" className="pl-0">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          <div className="relative rounded-lg overflow-hidden mb-6">
            <img 
              src={module.image || "/placeholder.svg"} 
              alt={module.title} 
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <Button size="lg" className="rounded-full w-16 h-16 flex items-center justify-center">
                <PlayIcon className="h-8 w-8" />
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
          <p className="text-gray-500 mb-6">{module.description}</p>
          
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="prose max-w-none">
                <p>{module.overview}</p>
                
                <h3 className="text-xl font-semibold mt-6 mb-4">What You'll Learn</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Identify potential hazards associated with farm equipment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Properly operate tractors and harvesting machinery</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Perform routine safety inspections and maintenance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Implement emergency procedures when accidents occur</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Create a culture of safety on your farm</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="lessons">
              <div className="space-y-4">
                {module.lessons.map((lesson, index) => (
                  <Card key={lesson.id} className={lesson.completed ? "border-green-200 bg-green-50" : ""}>
                    <CardHeader className="p-4 flex flex-row items-center space-y-0">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center">
                          {lesson.completed && (
                            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                          )}
                          Lesson {index + 1}: {lesson.title}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {lesson.duration}
                        </CardDescription>
                      </div>
                      <Button variant={lesson.completed ? "outline" : "default"}>
                        {lesson.completed ? "Review" : "Start"}
                      </Button>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="resources">
              <div className="space-y-4">
                {module.resources.map((resource) => (
                  <Card key={resource.id}>
                    <CardHeader className="p-4 flex flex-row items-center space-y-0">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center">
                          <FileTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                          {resource.title}
                        </CardTitle>
                        <CardDescription>{resource.type}</CardDescription>
                      </div>
                      <Button variant="outline">Download</Button>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="discussion">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center py-8 text-gray-500">
                    <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    Join the discussion about this module.<br />
                    Share your experiences and ask questions.
                  </p>
                  <Button className="w-full">Start a Discussion</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar - 1/3 width on desktop */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {module.progress}% Complete
                </span>
                <span className="text-sm text-gray-500">
                  {module.lessons.filter(l => l.completed).length}/{module.lessons.length} Lessons
                </span>
              </div>
              <Progress value={module.progress} className="h-2" />
              
              <div className="mt-6">
                <Button className="w-full">
                  {module.progress > 0 ? "Continue Learning" : "Start Learning"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Module Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-gray-500">{module.duration}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BookOpenIcon className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Lessons</p>
                    <p className="text-sm text-gray-500">{module.lessons.length} lessons</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <AwardIcon className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Level</p>
                    <p className="text-sm text-gray-500">{module.level}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <img 
                  src={module.instructor.avatar || "/placeholder.svg"} 
                  alt={module.instructor.name} 
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{module.instructor.name}</p>
                  <p className="text-sm text-gray-500">{module.instructor.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">{module.instructor.bio}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}