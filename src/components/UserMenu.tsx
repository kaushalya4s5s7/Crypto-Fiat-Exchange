import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { LogOut, User, Settings } from 'lucide-react';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <User size={20} className="text-gray-300" />
        </div>
        <span className="text-sm font-medium">{user?.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 border border-gray-800">
          <div className="px-4 py-2 border-b border-gray-800">
            <p className="text-sm text-gray-300 truncate">{user?.email}</p>
          </div>
          
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/app/kyc');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center space-x-2"
          >
            <User size={16} />
            <span>Profile & KYC</span>
          </button>
          
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/app/settings');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center space-x-2"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}