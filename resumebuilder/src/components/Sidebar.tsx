import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-56 bg-white border-r h-full flex flex-col py-6 px-4 space-y-4">
      <nav className="flex flex-col space-y-2">
        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
        <Link href="/my-resumes" className="text-gray-700 hover:text-blue-600 font-medium">My Resumes</Link>
        <Link href="/templates" className="text-gray-700 hover:text-blue-600 font-medium">Templates</Link>
        <Link href="/settings" className="text-gray-700 hover:text-blue-600 font-medium">Settings</Link>
      </nav>
    </div>
  );
} 