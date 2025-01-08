import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useWalletStore } from '../store/wallet';

export function Convert() {
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { addTransaction, updateBalance } = useWalletStore();

  const currencies = ['BTC', 'ETH', 'USDT', 'USD', 'EUR'];
  const conversionRate = 45000; // Demo rate
  const fee = 0.001; // 0.1%

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const receivedAmount = (Number(amount) * conversionRate * (1 - fee)).toFixed(2);
      
      // Add transaction
      addTransaction({
        type: 'Convert',
        currency: fromCurrency,
        amount,
        value: `$${(Number(amount) * conversionRate).toFixed(2)}`,
        status: 'Completed',
      });

      // Update balances
      updateBalance(fromCurrency, (Number(amount) * -1).toString(), '$0');
      updateBalance(toCurrency, receivedAmount, `$${receivedAmount}`);

      // Reset form
      setAmount('');
      alert('Conversion successful!');
    } catch (error) {
      alert('Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Convert Crypto</h2>
        
        <form onSubmit={handleConvert} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* From Currency */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <ArrowRight size={24} className="text-gray-400" />
            </div>

            {/* To Currency */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              placeholder="Enter amount"
              min="0"
              step="0.00000001"
            />
          </div>

          {/* Conversion Details */}
          {amount && (
            <div className="bg-gray-800 p-4 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Conversion Rate</span>
                <span>1 {fromCurrency} = {conversionRate} {toCurrency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fee (0.1%)</span>
                <span>{(Number(amount) * fee).toFixed(8)} {fromCurrency}</span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-700">
                <span>You'll receive</span>
                <span>{(Number(amount) * conversionRate * (1 - fee)).toFixed(2)} {toCurrency}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Converting...' : 'Convert Now'}
          </button>
        </form>
      </div>
    </div>
  );
}