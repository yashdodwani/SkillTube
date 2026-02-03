import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Github, ExternalLink } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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
            
            <nav className="hidden md:flex items-center space-x-6">
              <span className="text-sm text-gray-600"></span>
              <a
                href="https://github.com/rajarshidattapy/SkillVideo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
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