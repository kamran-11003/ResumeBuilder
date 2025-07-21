'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Download, 
  Edit3, 
  Trash2,
  Eye,
  BarChart3,
  Calendar,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import DashboardNav from './DashboardNav';

interface Resume {
  id: string;
  title: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    thisMonth: 0,
    totalDownloads: 0,
    atsScore: 0
  });
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - in real app, fetch from API
      const mockResumes: Resume[] = [
        {
          id: '1',
          title: 'Software Engineer Resume',
          template: 'Deedy Resume',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          isPublic: true
        },
        {
          id: '2',
          title: 'Product Manager Resume',
          template: 'Modern Template',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          isPublic: false
        }
      ];

      setResumes(mockResumes);
      setStats({
        totalResumes: mockResumes.length,
        thisMonth: 2,
        totalDownloads: 15,
        atsScore: 87
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your dashboard</h1>
          <Link 
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <DashboardNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to your dashboard. Manage your resumes, cover letters, and profile.</p>
          </div>

          <div className="space-y-8">
            {/* My Resumes Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">My Resumes</h2>
                <p className="text-gray-600 text-sm">You have no resumes yet.</p>
              </div>
              <Link
                href="/build-resume-ai"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Generate Resume
              </Link>
            </div>

            {/* My Cover Letters Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">My Cover Letters</h2>
                <p className="text-gray-600 text-sm">You have no cover letters yet.</p>
              </div>
              <Link
                href="/cover-letter"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Generate Cover Letter
              </Link>
            </div>

            {/* My Profile Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">My Profile</h2>
                <p className="text-gray-600 text-sm">Keep your profile up to date for the best results.</p>
              </div>
              <Link
                href="/profile"
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 