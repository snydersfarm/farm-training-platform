import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, BookOpen, Award, ArrowRight } from 'lucide-react'

// This would come from your database in a real implementation
const trainingModules = [
  {
    id: 1,
    title: 'Farm Equipment Safety',
    description: 'Learn essential safety protocols for operating farm equipment and machinery.',
    duration: '2 hours',
    lessons: 5,
    level: 'Beginner',
    category: 'Safety',
    image: '/placeholder.svg?height=200&width=400'
  },
  {
    id: 2,
    title: 'Crop Rotation Techniques',
    description: 'Master the art of crop rotation to improve soil health and increase yields.',
    duration: '3 hours',
    lessons: 8,
    level: 'Intermediate',
    category: 'Crops',
    image: '/placeholder.svg?height=200&width=400'
  },
  {
    id: 3,
    title: 'Livestock Management',
    description: 'Comprehensive guide to caring for and managing farm animals effectively.',
    duration: '4 hours',
    lessons: 10,
    level: 'Advanced',
    category: 'Livestock',
    image: '/placeholder.svg?height=200&width=400'
  },
  {
    id: 4,
    title: 'Sustainable Farming Practices',
    description: 'Explore environmentally friendly approaches to modern farming.',
    duration: '3 hours',
    lessons: 7,
    level: 'Intermediate',
    category: 'Sustainability',
    image: '/placeholder.svg?height=200&width=400'
  },
  {
    id: 5,
    title: 'Farm Business Management',
    description: 'Learn how to run the business side of your farm efficiently and profitably.',
    duration: '5 hours',
    lessons: 12,
    level: 'Advanced',
    category: 'Business',
    image: '/placeholder.svg?height=200&width=400'
  },
  {
    id: 6,
    title: 'Irrigation Systems',
    description: 'Understanding and implementing effective water management systems.',
    duration: '2.5 hours',
    lessons: 6,
    level: 'Intermediate',
    category: 'Infrastructure',
    image: '/placeholder.svg?height=200&width=400'
  }
]

export default function ModulesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Training Modules</h1>
          <p className="text-gray-500 mt-2">Explore our comprehensive farm training curriculum</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Badge className="px-3 py-1 cursor-pointer bg-primary">All</Badge>
        <Badge className="px-3 py-1 cursor-pointer" variant="outline">Safety</Badge>
        <Badge className="px-3 py-1 cursor-pointer" variant="outline">Crops</Badge>
        <Badge className="px-3 py-1 cursor-pointer" variant="outline">Livestock</Badge>
        <Badge className="px-3 py-1 cursor-pointer" variant="outline">Sustainability</Badge>
        <Badge className="px-3 py-1 cursor-pointer" variant="outline">Business</Badge>
        <Badge className="px-3 py-1 cursor-pointer" variant="outline">Infrastructure</Badge>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingModules.map((module) => (
          <Card key={module.id} className="overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
              <img 
                src={module.image || "/placeholder.svg"} 
                alt={module.title} 
                className="object-cover w-full h-full"
              />
              <Badge className="absolute top-3 right-3">{module.category}</Badge>
            </div>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {module.duration}
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {module.lessons} lessons
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {module.level}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/modules/${module.id}`} className="w-full">
                <Button className="w-full">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}