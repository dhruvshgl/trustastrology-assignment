import Sidebar from "../_components/Sidebar";
import LogoutButton from "../_components/LogoutButton";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      
      {}
      <div className="w-64 bg-gray-900 text-white hidden md:block">
        <Sidebar />
      </div>

      {}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {}
        <div className="sticky top-0 z-10 flex items-center justify-end bg-transparent p-2 md:p-4">
          <LogoutButton />
        </div>

        {}
        <div className="flex-1 overflow-auto pb-24 md:pb-0">
          {children}
        </div>
      </div>

    </div>
  );
}