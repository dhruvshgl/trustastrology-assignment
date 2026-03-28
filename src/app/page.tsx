import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      
      <div className="w-full max-w-4xl text-center">
        
        {}
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          Your AI Assistant
        </h1>

        {}
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm sm:text-lg max-w-xl mx-auto">
          Ask anything, get intelligent responses, and manage conversations seamlessly.
        </p>

        {}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-black text-white font-medium hover:opacity-90 transition"
          >
            Get Started
          </Link>

          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-black text-white font-medium hover:opacity-90 transition"
          >
            Login
          </Link>

        </div>

        {}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
             Fast Responses
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
             Multi-Agent AI
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
            Chat History
          </div>

        </div>

      </div>
    </main>
  );
}