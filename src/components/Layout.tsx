import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { UserMenu } from './UserMenu';
import { 
  LayoutDashboard, 
  Wallet2, 
  ArrowRightLeft,
  Shield,
  Settings,
  HelpCircle,
  Bell
} from 'lucide-react';

export function Layout() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-gray-900 border-r border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <Link to="/app" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">C</span>
              </div>
              <span className="text-xl font-bold">CryptoX</span>
            </Link>
          </div>
          <div className="p-4">
            <nav className="space-y-1">
              <Link 
                to="/app" 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/app') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/app/wallet" 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/app/wallet') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Wallet2 size={20} />
                <span>Wallet</span>
              </Link>
              <Link 
                to="/app/convert" 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/app/convert') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <ArrowRightLeft size={20} />
                <span>Convert</span>
              </Link>
              <Link 
                to="/app/kyc" 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActiveRoute('/app/kyc') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Shield size={20} />
                <span>Security & KYC</span>
              </Link>
            </nav>

            <div className="mt-8">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Support
              </h3>
              <nav className="mt-4 space-y-1">
                <a 
                  href="#" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <HelpCircle size={20} />
                  <span>Help Center</span>
                </a>
                <a 
                  href="#" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold">Welcome back</h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                <Bell size={20} />
              </button>
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}