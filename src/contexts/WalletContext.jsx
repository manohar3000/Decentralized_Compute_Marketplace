import React, { createContext, useState, useContext, useEffect } from 'react';
import Web3 from 'web3';

// Create wallet context
const WalletContext = createContext();

// Hook to use wallet context
export const useWallet = () => useContext(WalletContext);

// Wallet provider component
export const WalletProvider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize web3
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      
      // Check if already connected
      checkIfConnected(web3Instance);
      
      // Setup event listeners
      setupEventListeners();
    }
  }, []);
  
  // Check if wallet is already connected
  const checkIfConnected = async (web3Instance) => {
    try {
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };
  
  // Setup event listeners for wallet changes
  const setupEventListeners = () => {
    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Handle chain changes
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Handle disconnect
      window.ethereum.on('disconnect', handleDisconnect);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  };
  
  // Handle accounts changed event
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      handleDisconnect();
    } else {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      
      // Get balance and chain ID
      if (web3) {
        updateBalanceAndChain(accounts[0]);
      }
    }
  };
  
  // Update balance and chain ID
  const updateBalanceAndChain = async (address) => {
    try {
      const balance = await web3.eth.getBalance(address);
      const formattedBalance = web3.utils.fromWei(balance, 'ether');
      setWalletBalance(parseFloat(formattedBalance).toFixed(4));
      
      const chainId = await web3.eth.getChainId();
      setChainId(chainId);
    } catch (error) {
      console.error("Error updating balance and chain:", error);
    }
  };
  
  // Handle chain changed event
  const handleChainChanged = (chainId) => {
    // Convert from hex to decimal
    const chainIdDecimal = parseInt(chainId, 16);
    setChainId(chainIdDecimal);
    
    // Reload page as recommended by MetaMask
    window.location.reload();
  };
  
  // Handle disconnect event
  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress('');
    setWalletBalance(0);
    setChainId(null);
  };

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet!");
      return null;
    }
    
    try {
      setIsConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Handle the connected account
      handleAccountsChanged(accounts);
      
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function (for UI purposes)
  const disconnectWallet = () => {
    handleDisconnect();
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  // Export the wallet context value
  const value = {
    isConnected,
    walletAddress,
    walletBalance,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext; 