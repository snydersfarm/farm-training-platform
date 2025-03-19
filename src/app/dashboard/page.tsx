import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function DashboardPage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)
  
  // If not authenticated, redirect to login
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Farm Training Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard Cards */}
        <DashboardCard 
          title="Training Sessions" 
          value="12" 
          description="Active training sessions" 
        />
        <DashboardCard 
          title="Farm Areas" 
          value="5" 
          description="Managed areas" 
        />
        <DashboardCard 
          title="Equipment" 
          value="24" 
          description="Available equipment" 
        />
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <p>Your dashboard content will appear here</p>
        </div>
      </div>
    </div>
  )
}

// Dashboard Card Component
function DashboardCard({ 
  title, 
  value, 
  description 
}: { 
  title: string; 
  value: string; 
  description: string 
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-gray-500 mt-1">{description}</p>
    </div>
  )
}