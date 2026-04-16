import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Github, ExternalLink, LayoutDashboard, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <PlayCircle className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                SkillVid
              </span>
            </Link>

            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <span className="hidden md:block text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Link>
                </>
              )}
              <a
                href="https://github.com/rajarshidattapy/SkillVideo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <PlayCircle className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-semibold text-gray-900">SkillVid</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Transform YouTube videos into interactive courses</span>
              <a
                href="https://github.com/rajarshidattapy/SkillVideo"
                className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
              >
                <span>Documentation</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
