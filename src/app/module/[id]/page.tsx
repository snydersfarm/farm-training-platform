"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { moduleService } from "@/lib/services/module.service";

interface ModuleWithProgress {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  userProgress?: {
    id: string;
    userId: string;
    moduleId: string;
    progressPercentage: number;
  };
}

export default function ModulePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const [module, setModule] = useState<ModuleWithProgress | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated" && session.user) {
      loadModule();
    }
  }, [status, session]);

  const loadModule = async () => {
    try {
      const moduleData = await moduleService.getModuleWithProgress(params.id, session!.user.id);
      setModule(moduleData);
      setProgress(moduleData.userProgress?.progressPercentage || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading module:", error);
      setIsLoading(false);
    }
  };

  const handleProgressUpdate = async (newProgress: number) => {
    try {
      await moduleService.updateProgress(session!.user.id, params.id, newProgress);
      setProgress(newProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardNav user={session?.user} />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardNav user={session?.user} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Module not found</h2>
            <p className="mt-2 text-gray-600">The requested module could not be found.</p>
            <a
              href="/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Return to Dashboard
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav user={session?.user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{module.title}</h1>
            <p className="text-gray-600 mb-6">{module.description}</p>
            
            <div className="prose max-w-none mb-8">
              {module.content}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Track Your Progress</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Your Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"
                  ></div>
                </div>
                <div className="flex justify-between gap-4">
                  {[0, 25, 50, 75, 100].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleProgressUpdate(value)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        progress === value
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </a>
              {module.order > 1 && (
                <a
                  href={`/module/${module.order - 1}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous Module
                </a>
              )}
              <a
                href={`/module/${module.order + 1}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Next Module
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 