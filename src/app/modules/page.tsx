import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define SVG icon components to replace lucide-react
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

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

// This would come from your database in a real implementation
const trainingModules = [
  {
    id: 1,
    title: "Farm Equipment Safety",
    description: "Learn essential safety practices for operating farm equipment and machinery.",
    duration: "3 hours",
    lessons: 7,
    level: "Beginner",
    category: "Safety",
    progress: 40
  },
  {
    id: 2,
    title: "Tractor Operation Safety",
    description: "Comprehensive training on safe tractor operation and maintenance procedures.",
    duration: "4 hours",
    lessons: 8,
    level: "Intermediate",
    category: "Safety",
    progress: 20
  },
  {
    id: 3,
    title: "Livestock Management",
    description: "Essential practices for managing and caring for livestock on your farm.",
    duration: "4 hours",
    lessons: 10,
    level: "Intermediate",
    category: "Livestock",
    progress: 0
  },
  {
    id: 4,
    title: "Sustainable Farming Practices",
    description: "Learn environmentally-friendly farming techniques and sustainable agriculture methods.",
    duration: "3 hours",
    lessons: 7,
    level: "Advanced",
    category: "Sustainability",
    progress: 0
  },
  {
    id: 5,
    title: "Crop Rotation Techniques",
    description: "Improve soil health and crop yields with effective rotation strategies.",
    duration: "2.5 hours",
    lessons: 6,
    level: "Intermediate",
    category: "Crops",
    progress: 0
  },
  {
    id: 6,
    title: "Irrigation Systems",
    description: "Setting up and maintaining efficient irrigation systems for your farm.",
    duration: "2.5 hours",
    lessons: 6,
    level: "Intermediate",
    category: "Equipment",
    progress: 0
  }
]

export default function ModulesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Training Modules</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingModules.map((module) => (
          <Link href={`/modules/${module.id}`} key={module.id} className="block group">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <Badge className="w-fit mb-2">{module.category}</Badge>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{module.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpenIcon className="h-4 w-4 mr-1" />
                    <span>{module.lessons} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <AwardIcon className="h-4 w-4 mr-1" />
                    <span>{module.level}</span>
                  </div>
                </div>
                
                {module.progress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full group-hover:bg-primary-600">
                  {module.progress > 0 ? 'Continue' : 'Start'} Module
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

