import { ethers } from 'ethers';

const SUPPORTED_NETWORKS = {
  ethereum: '0x1',
  bsc: '0x38',
  polygon: '0x89'
};

export type NetworkType = keyof typeof SUPPORTED_NETWORKS;

export async function checkNetwork(desiredNetwork: NetworkType): Promise<boolean> {
  if (!window.ethereum) return false;
  
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return chainId === SUPPORTED_NETWORKS[desiredNetwork];
}

export async function switchNetwork(network: NetworkType): Promise<void> {
  if (!window.ethereum) throw new Error('MetaMask is not installed');
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SUPPORTED_NETWORKS[network] }],
    });
  } catch (error: any) {
    throw new Error(`Failed to switch network: ${error.message}`);
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    
    // Setup event listeners
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        window.location.reload();
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    return { 
      address: accounts[0], 
      signer,
      chainId: await window.ethereum.request({ method: 'eth_chainId' })
    };
  } catch (error: any) {
    throw new Error(`Failed to connect wallet: ${error.message}`);
  }
}

export async function sendTransaction(to: string, amount: string) {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Validate the address
    if (!ethers.isAddress(to)) {
      throw new Error('Invalid recipient address');
    }

    // Get current gas price
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const gasPrice = await provider.getGasPrice();

    // Estimate gas limit
    const gasLimit = await provider.estimateGas({
      to,
      value: ethers.parseEther(amount),
      from: await signer.getAddress()
    });

    // Send transaction with gas estimation
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseEther(amount),
      gasLimit: gasLimit * BigInt(12) / BigInt(10), // Add 20% buffer
      gasPrice
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    return { 
      hash: receipt?.hash,
      status: receipt?.status === 1 ? 'success' : 'failed'
    };
  } catch (error: any) {
    // Handle specific error cases
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for transaction');
    } else if (error.code === 'USER_REJECTED') {
      throw new Error('Transaction rejected by user');
    }
    throw new Error(error.message || 'Transaction failed');
  }
}

export async function getBalance(address: string) {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error: any) {
    throw new Error('Failed to fetch balance');
  }
}

export function disconnectWallet() {
  if (window.ethereum) {
    window.ethereum.removeListener('accountsChanged', () => {});
    window.ethereum.removeListener('chainChanged', () => {});
  }
}