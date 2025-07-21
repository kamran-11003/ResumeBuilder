import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="sticky top-0 w-full bg-white border-b z-50 flex items-center justify-between px-8 h-16 shadow-sm">
      <div className="flex items-center space-x-4">
        <span className="text-xl font-bold text-blue-700">ResumeBuilder</span>
        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
        <Link href="/my-resumes" className="text-gray-700 hover:text-blue-600 font-medium">Resumes</Link>
        <Link href="/cover-letter" className="text-gray-700 hover:text-blue-600 font-medium">Cover Letter</Link>
        <Link href="/ats-checker" className="text-gray-700 hover:text-blue-600 font-medium">ATS Checker</Link>
      </div>
      {/* Add user/profile dropdown or tools here if needed */}
    </nav>
  );
} 