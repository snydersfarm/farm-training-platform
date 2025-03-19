import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

type Params = {
  id: string;
};

export async function generateMetadata({ 
  params 
}: { 
  params: Params 
}): Promise<Metadata> {
  const module = await prisma.module.findUnique({
    where: { id: params.id }
  });

  return {
    title: module ? `${module.title} - Farm Training Platform` : 'Module - Farm Training Platform',
    description: module?.description || 'Learn farming techniques and best practices',
  };
}

export default async function ModulePage({ 
  params 
}: { 
  params: Params 
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const module = await prisma.module.findUnique({
    where: { id: params.id }
  });

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Module not found</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">{module.title}</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <p className="text-gray-700 mb-4">{module.description}</p>
        <div className="prose max-w-none">
          {module.content}
        </div>
      </div>
    </div>
  );
} 