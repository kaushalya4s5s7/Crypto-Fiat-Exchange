import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { Shield, Upload } from 'lucide-react';

export function KYC() {
  const { user, submitKYCDocument, updateKYCStatus } = useAuthStore();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile || !addressFile) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      submitKYCDocument('id', idFile);
      submitKYCDocument('address', addressFile);
      updateKYCStatus('basic');
      
      alert('KYC documents submitted successfully!');
    } catch (error) {
      alert('Failed to submit KYC documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="text-blue-500" size={24} />
          <h2 className="text-2xl font-bold">KYC Verification</h2>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-300">Current Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              user?.kycStatus === 'advanced'
                ? 'bg-green-900 text-green-300'
                : user?.kycStatus === 'basic'
                ? 'bg-yellow-900 text-yellow-300'
                : 'bg-red-900 text-red-300'
            }`}>
              {user?.kycStatus}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Complete KYC verification to unlock higher transaction limits
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Government ID
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG or PDF (MAX. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            {idFile && (
              <p className="text-sm text-gray-400">Selected: {idFile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Proof of Address
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG or PDF (MAX. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => setAddressFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            {addressFile && (
              <p className="text-sm text-gray-400">Selected: {addressFile.name}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !idFile || !addressFile}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Submitting...' : 'Submit Documents'}
          </button>
        </form>
      </div>
    </div>
  );
}