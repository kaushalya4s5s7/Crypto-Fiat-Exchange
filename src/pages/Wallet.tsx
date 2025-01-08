import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, QrCode } from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { useAuthStore } from '../store/auth';
import { sendTransaction, checkNetwork, switchNetwork, disconnectWallet, NetworkType } from '../lib/web3';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function Wallet() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [selectedAsset, setSelectedAsset] = useState('eth');
  const [amount, setAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const { addTransaction, updateBalance } = useWalletStore();
  const { user, connectWallet: setWalletAddress } = useAuthStore();

  const networks = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'bsc', name: 'BNB Smart Chain', symbol: 'BNB' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
  ];

  useEffect(() => {
    return () => {
      disconnectWallet();
    };
  }, []);

  const handleNetworkSwitch = async (networkId: NetworkType) => {
    try {
      setLoading(true);
      setNetworkError(null);
      await switchNetwork(networkId);
      setSelectedAsset(networkId);
    } catch (error: any) {
      setNetworkError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install MetaMask and try again.');
      return;
    }

    try {
      setLoading(true);
      setNetworkError(null);

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // Check the selected network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isCorrectNetwork = await checkNetwork(selectedAsset as NetworkType);

      if (!isCorrectNetwork) {
        await handleNetworkSwitch(selectedAsset as NetworkType);
      }

      setWalletAddress(address);
      alert('Wallet connected successfully!');
    } catch (error: any) {
      setNetworkError(error.message || 'Failed to connect MetaMask.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!user?.walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      await navigator.clipboard.writeText(user.walletAddress);
      alert('Address copied to clipboard!');
    } catch (error) {
      alert('Failed to copy address');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !withdrawalAddress) return;
    if (!user?.walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    // Check KYC status for large amounts
    if (Number(amount) > 1 && user.kycStatus === 'none') {
      alert('KYC verification required for withdrawals over 1 ETH');
      return;
    }

    setLoading(true);
    try {
      const tx = await sendTransaction(withdrawalAddress, amount);

      addTransaction({
        type: 'Withdraw',
        currency: selectedAsset.toUpperCase(),
        amount,
        value: `$${(Number(amount) * 45000).toFixed(2)}`,
        status: 'Pending',
      });

      updateBalance(
        selectedAsset.toUpperCase(),
        (Number(amount) * -1).toString(),
        `$${(Number(amount) * 45000).toFixed(2)}`
      );

      setAmount('');
      setWithdrawalAddress('');
      alert('Withdrawal initiated successfully!');
    } catch (error) {
      alert('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {/* Connect Wallet Button */}
        {!user?.walletAddress && (
          <div className="p-4 bg-blue-900/20 border border-blue-800">
            <button
              onClick={handleConnectWallet}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        )}

        {/* Wallet Address and Copy */}
        {user?.walletAddress && (
          <div className="p-4 text-white">
            <p>Wallet Address: {user.walletAddress}</p>
            <button
              onClick={handleCopy}
              className="mt-2 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md font-medium"
            >
              Copy Address
            </button>
          </div>
        )}

        {/* Network Selection */}
        {user?.walletAddress && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-lg font-medium mb-3">Select Network</h3>
            <div className="grid grid-cols-3 gap-3">
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => handleNetworkSwitch(network.id as NetworkType)}
                  className={`p-3 rounded-lg text-center ${
                    selectedAsset === network.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {user?.walletAddress && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'deposit'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'withdraw'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Withdraw
              </button>
            </div>

            {/* Deposit Section */}
            {activeTab === 'deposit' && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Deposit {networks.find(n => n.id === selectedAsset)?.symbol}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Send funds to your wallet address below:
                  </p>
                  <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-mono">{user.walletAddress}</span>
                    <button
                      onClick={handleCopy}
                      className="p-2 hover:bg-gray-600 rounded-md"
                      title="Copy Address"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="mt-4 text-sm text-yellow-400">
                    Important: Only send {networks.find(n => n.id === selectedAsset)?.symbol} on {networks.find(n => n.id === selectedAsset)?.name} network
                  </div>
                </div>
              </div>
            )}

            {/* Withdraw Section */}
            {activeTab === 'withdraw' && (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={withdrawalAddress}
                    onChange={(e) => setWithdrawalAddress(e.target.value)}
                    placeholder={`Enter ${networks.find(n => n.id === selectedAsset)?.symbol} address`}
                    className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount ({networks.find(n => n.id === selectedAsset)?.symbol})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.000001"
                    min="0"
                    className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Withdraw ${networks.find(n => n.id === selectedAsset)?.symbol}`}
                </button>
                {networkError && (
                  <div className="text-red-400 text-sm mt-2">{networkError}</div>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
