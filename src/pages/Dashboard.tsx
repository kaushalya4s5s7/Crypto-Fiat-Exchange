import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LogOut, Wallet as WalletIcon, RefreshCw, CreditCard, Building2 as Bank, ChevronDown, Copy, Check } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';

// Your UPI ID
const MERCHANT_UPI = "chaudharikaushal02@oksbi"; // Replace with your actual UPI ID

// Mock data for supported chains and currencies (in production, fetch from API)
const SUPPORTED_CHAINS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '⟠' },
  { id: 'bsc', name: 'BNB Chain', symbol: 'BNB', icon: '⛓️' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', icon: '🟣' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', icon: '🔺' },
];

const SUPPORTED_TOKENS = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', price: 180000 },
    { symbol: 'USDT', name: 'Tether', price: 83.25 },
    { symbol: 'USDC', name: 'USD Coin', price: 83.25 },
  ],
  bsc: [
    { symbol: 'BNB', name: 'BNB', price: 25000 },
    { symbol: 'BUSD', name: 'Binance USD', price: 83.25 },
    { symbol: 'USDT', name: 'Tether', price: 83.25 },
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', price: 80 },
    { symbol: 'USDT', name: 'Tether', price: 83.25 },
    { symbol: 'USDC', name: 'USD Coin', price: 83.25 },
  ],
  avalanche: [
    { symbol: 'AVAX', name: 'Avalanche', price: 2800 },
    { symbol: 'USDT', name: 'Tether', price: 83.25 },
    { symbol: 'USDC', name: 'USD Coin', price: 83.25 },
  ],
};

const FIAT_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

// Exchange rates (in production, fetch from API)
const EXCHANGE_RATES = {
  USD: { INR: 83.25, EUR: 0.91 },
  INR: { USD: 0.012, EUR: 0.011 },
  EUR: { USD: 1.10, INR: 91.50 },
};

interface WalletState {
  address: string;
  balance: string;
  network: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Pay using any UPI app'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: <Bank className="w-6 h-6" />,
    description: 'Direct bank transfer (IMPS/NEFT)'
  }
];

interface PaymentModalProps {
  amount: string;
  fiatCurrency: { code: string; symbol: string };
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, fiatCurrency, onClose, onSuccess }) => {
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [verifying, setVerifying] = useState(false);

  const upiUrl = `upi://pay?pa=${MERCHANT_UPI}&pn=CryptoX&am=${amount}&cu=${fiatCurrency.code}&tn=Buy Crypto`;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyPayment = async () => {
    if (!transactionId) return;
    
    setVerifying(true);
    // Here you would verify the payment with your backend
    // For demo, we'll simulate a successful verification after 2 seconds
    setTimeout(() => {
      setVerifying(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-white/10 rounded-lg p-6 max-w-md w-full space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold">Complete Payment</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
            <p className="text-sm text-white/60">Amount to Pay</p>
            <p className="text-2xl font-bold">{fiatCurrency.symbol}{amount}</p>
          </div>

          <div className="flex justify-center bg-white p-4 rounded-lg">
            <QRCodeSVG value={upiUrl} size={200} />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/60">UPI ID</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={MERCHANT_UPI}
                readOnly
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none"
              />
              <button
                onClick={() => handleCopy(MERCHANT_UPI)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/60">Enter UPI Transaction ID</p>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter 12-digit Transaction ID"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <button
            onClick={verifyPayment}
            disabled={!transactionId || verifying}
            className="w-full px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify Payment'}
          </button>

          <p className="text-sm text-white/60 text-center">
            1. Scan QR code or copy UPI ID<br />
            2. Complete payment in your UPI app<br />
            3. Enter Transaction ID and verify
          </p>
        </div>
      </div>
    </div>
  );
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[SUPPORTED_CHAINS[0].id][0]);
  const [selectedFiat, setSelectedFiat] = useState(FIAT_CURRENCIES[0]);
  const [selectedPayment, setSelectedPayment] = useState<string>('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Connect to wallet based on selected chain
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      setLoading(true);
      setError('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);

      setWallet({
        address: accounts[0],
        balance: ethers.formatEther(balance),
        network: network.name
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate crypto amount based on fiat
  const calculateCrypto = (fiatAmount: string): string => {
    const amount = parseFloat(fiatAmount);
    if (isNaN(amount)) return '0';
    const usdAmount = selectedFiat.code === 'USD' 
      ? amount 
      : amount * EXCHANGE_RATES[selectedFiat.code].USD;
    return (usdAmount / selectedToken.price).toFixed(6);
  };

  // Calculate fiat amount based on crypto
  const calculateFiat = (cryptoAmount: string): string => {
    const amount = parseFloat(cryptoAmount);
    if (isNaN(amount)) return '0';
    const usdAmount = amount * selectedToken.price;
    return (selectedFiat.code === 'USD' 
      ? usdAmount 
      : usdAmount * EXCHANGE_RATES.USD[selectedFiat.code]
    ).toFixed(2);
  };

  // Handle buy crypto
  const handleBuy = async () => {
    if (!amount || !wallet) return;
    
    if (selectedPayment === 'upi') {
      setShowPaymentModal(true);
    } else {
      // Handle bank transfer
      alert(`Please complete your bank transfer of ${selectedFiat.symbol}${amount}`);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setAmount('');
    alert('Payment successful! Your crypto will be credited soon.');
  };

  // Handle sell crypto
  const handleSell = async () => {
    if (!amount || !wallet) return;
    
    try {
      setLoading(true);
      setError('');

      // Here you would handle the crypto transfer based on selected chain
      alert(`Your bank account will be credited with ${selectedFiat.symbol}${calculateFiat(amount)} within 24 hours`);
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <h1 className="font-serif text-2xl font-bold">CryptoX Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
          {!wallet ? (
            <div className="text-center">
              <WalletIcon size={48} className="mx-auto mb-4 text-white/60" />
              <button
                onClick={connectWallet}
                disabled={loading}
                className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Connecting...' : `Connect to ${selectedChain.name}`}
              </button>
              {error && <p className="mt-2 text-red-400">{error}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold">Wallet Connected</h2>
                <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                  {wallet.network}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/60">Your Address</p>
                  <p className="font-mono truncate">{wallet.address}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/60">Your Balance</p>
                  <p>{wallet.balance} {selectedToken.symbol}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
          <div className="flex space-x-4 mb-6">
            {(['buy', 'sell'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'bg-white text-black' 
                    : 'border border-white/10 hover:bg-white/5'
                }`}
              >
                {tab} Crypto
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-white/60">Select Chain</label>
                <select
                  value={selectedChain.id}
                  onChange={(e) => {
                    const chain = SUPPORTED_CHAINS.find(c => c.id === e.target.value)!;
                    setSelectedChain(chain);
                    setSelectedToken(SUPPORTED_TOKENS[chain.id][0]);
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  {SUPPORTED_CHAINS.map(chain => (
                    <option key={chain.id} value={chain.id}>
                      {chain.icon} {chain.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-white/60">Select Token</label>
                <select
                  value={selectedToken.symbol}
                  onChange={(e) => {
                    setSelectedToken(SUPPORTED_TOKENS[selectedChain.id].find(t => t.symbol === e.target.value)!);
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  {SUPPORTED_TOKENS[selectedChain.id].map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'buy' ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm text-white/60">Amount</label>
                    <select
                      value={selectedFiat.code}
                      onChange={(e) => {
                        setSelectedFiat(FIAT_CURRENCIES.find(f => f.code === e.target.value)!);
                      }}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      {FIAT_CURRENCIES.map(fiat => (
                        <option key={fiat.code} value={fiat.code}>
                          {fiat.symbol} {fiat.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder={`Enter amount in ${selectedFiat.code}`}
                  />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/60">You will receive</p>
                  <p className="text-lg font-bold">{calculateCrypto(amount)} {selectedToken.symbol}</p>
                  <p className="text-sm text-white/60">
                    1 {selectedToken.symbol} = {selectedFiat.symbol}
                    {(selectedToken.price * (selectedFiat.code === 'USD' ? 1 : EXCHANGE_RATES.USD[selectedFiat.code])).toFixed(2)} {selectedFiat.code}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-white/60">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          selectedPayment === method.id
                            ? 'border-white bg-white/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {method.icon}
                          <div className="text-left">
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-white/60">{method.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleBuy}
                  disabled={!wallet || loading || !amount}
                  className="w-full px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Buy ${selectedToken.symbol}`}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm text-white/60">Amount</label>
                    <select
                      value={selectedFiat.code}
                      onChange={(e) => {
                        setSelectedFiat(FIAT_CURRENCIES.find(f => f.code === e.target.value)!);
                      }}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      {FIAT_CURRENCIES.map(fiat => (
                        <option key={fiat.code} value={fiat.code}>
                          {fiat.symbol} {fiat.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder={`Enter amount in ${selectedToken.symbol}`}
                  />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/60">You will receive</p>
                  <p className="text-lg font-bold">
                    {selectedFiat.symbol}{calculateFiat(amount)} {selectedFiat.code}
                  </p>
                  <p className="text-sm text-white/60">
                    1 {selectedToken.symbol} = {selectedFiat.symbol}
                    {(selectedToken.price * (selectedFiat.code === 'USD' ? 1 : EXCHANGE_RATES.USD[selectedFiat.code])).toFixed(2)} {selectedFiat.code}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-white/60">Bank Account Details</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 mb-2"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <button
                  onClick={handleSell}
                  disabled={!wallet || loading || !amount}
                  className="w-full px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Sell ${selectedToken.symbol}`}
                </button>
              </>
            )}

            {error && <p className="text-red-400">{error}</p>}
          </div>
        </section>
      </main>

      {showPaymentModal && (
        <PaymentModal
          amount={amount}
          fiatCurrency={selectedFiat}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}