import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Welcome to the AI Assistant</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">An assistant powered  Ask questions, get structured answers.</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/chat" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-white text-sm font-medium hover:bg-blue-700">
              Open Chat
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
