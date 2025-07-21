'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FileText, User, ChevronDown } from 'lucide-react';

export default function DashboardNav() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">ResumeBuilder</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/my-resumes" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">My Resumes</Link>
            <Link href="/cover-letter" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Cover Letter</Link>
            <Link href="/build-resume-ai" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Generate Resume</Link>
            <Link href="/cover-letter" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Cover Letter Generator</Link>
            <Link href="/ats-checker" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Check ATS</Link>
            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                <User className="w-6 h-6 text-gray-700" />
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                  <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</Link>
                  <Link href="/billing" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Billing</Link>
                  <Link href="/subscription" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Subscription</Link>
                  <button
                    onClick={() => {
                      window.location.href = '/auth/signout';
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 