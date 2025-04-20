import React, { useState, useRef, useEffect } from 'react';
import './WalletConnect.css';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';

const WalletConnect = () => {
  const { 
    isConnected, 
    walletAddress, 
    walletBalance,
    chainId,
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    formatAddress 
  } = useWallet();
  
  const { supportedNetworks, switchToSupportedNetwork, networkError } = useContract();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Get network name based on chainId
  const getNetworkName = (id) => {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon',
      80001: 'Mumbai Testnet',
      56: 'BSC',
      97: 'BSC Testnet',
      42161: 'Arbitrum',
      421613: 'Arbitrum Goerli',
      10: 'Optimism',
      420: 'Optimism Goerli'
    };
    return networks[id] || `Network ID ${id}`;
  };

  // Check if current network is supported
  const isNetworkSupported = () => {
    if (!chainId || !supportedNetworks) return false;
    return supportedNetworks.some(network => network.id === chainId);
  };
  
  // Handle network switch
  const handleSwitchNetwork = async () => {
    await switchToSupportedNetwork();
  };

  return (
    <div className="wallet-connect-container">
      {!isConnected ? (
        <button 
          className="connect-wallet-btn" 
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-connected" ref={dropdownRef}>
          <button 
            className="wallet-address-btn" 
            onClick={toggleDropdown}
          >
            <span className="wallet-indicator"></span>
            <span className="wallet-address">{formatAddress(walletAddress)}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {dropdownOpen && (
            <div className="wallet-dropdown">
              <div className="dropdown-address">
                <span className="address-label">Connected:</span>
                <span className="address-value">{formatAddress(walletAddress)}</span>
              </div>
              
              <div className="wallet-balance">
                <span className="balance-label">Balance:</span>
                <span className="balance-value">{walletBalance} ETH</span>
                <span className={`network-badge ${isNetworkSupported() ? 'network-supported' : 'network-unsupported'}`}>
                  {getNetworkName(chainId)}
                </span>
              </div>
              
              {!isNetworkSupported() && (
                <div className="network-warning">
                  <p>Unsupported network. The marketplace is only available on Sepolia Testnet.</p>
                  <button onClick={handleSwitchNetwork} className="switch-network-btn">
                    Switch to Sepolia
                  </button>
                </div>
              )}
              
              <button className="copy-address-btn" onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                alert('Address copied to clipboard!');
              }}>
                Copy Address
              </button>
              
              <button className="view-explorer-btn" onClick={() => {
                const explorerUrl = chainId === 1 ? 'https://etherscan.io' :
                                   chainId === 5 ? 'https://goerli.etherscan.io' : 
                                   chainId === 11155111 ? 'https://sepolia.etherscan.io' :
                                   chainId === 137 ? 'https://polygonscan.com' :
                                   chainId === 80001 ? 'https://mumbai.polygonscan.com' :
                                   chainId === 56 ? 'https://bscscan.com' :
                                   chainId === 42161 ? 'https://arbiscan.io' :
                                   'https://etherscan.io';
                                   
                window.open(`${explorerUrl}/address/${walletAddress}`, '_blank');
              }}>
                View on Explorer
              </button>
              
              <button className="disconnect-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 