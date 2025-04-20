import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

const NetworkDebug = () => {
  const { isConnected, chainId, walletAddress } = useWallet();
  const { switchToSupportedNetwork, supportedNetworks, networkError, contractAddress } = useContract();

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

  // Manually force reload the page
  const handleReload = () => {
    window.location.reload();
  };

  // Switch to Sepolia testnet
  const handleSwitchToSepolia = async () => {
    try {
      // Sepolia chainId in hex
      const sepoliaChainId = '0xaa36a7'; // 11155111 in decimal
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
      
      // Reload after network switch
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error switching to Sepolia:", error);
      alert("Failed to switch network. Please try manually in your wallet settings.");
    }
  };

  return (
    <div style={{
      padding: '20px',
      margin: '20px 0',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      border: '1px solid #333'
    }}>
      <h3>Network Debug Info</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Wallet Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
        <p><strong>Current Network:</strong> {chainId ? `${getNetworkName(chainId)} (${chainId})` : 'Not connected'}</p>
        <p><strong>Is Supported Network:</strong> {isNetworkSupported() ? 'Yes' : 'No'}</p>
        <p><strong>Contract Address:</strong> {contractAddress || 'Not initialized'}</p>
        <p><strong>Network Error:</strong> {networkError || 'None'}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleReload}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4a4a4a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
        
        <button 
          onClick={handleSwitchToSepolia}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffb300',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Switch to Sepolia
        </button>
        
        <button 
          onClick={switchToSupportedNetwork}
          style={{
            padding: '8px 16px',
            backgroundColor: '#00eeff',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Use Contract Switcher
        </button>
      </div>
    </div>
  );
};

export default NetworkDebug; 