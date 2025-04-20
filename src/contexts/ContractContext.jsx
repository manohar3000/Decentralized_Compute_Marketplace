import React, { createContext, useState, useContext, useEffect } from 'react';
import Web3 from 'web3';
import ComputeMarketplaceABI from '../contracts/ComputeMarketplace.json';
import { useWallet } from './WalletContext';

// Create contract context
const ContractContext = createContext();

// Hook to use contract context
export const useContract = () => useContext(ContractContext);

// Helper function to get the network name
const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai Testnet',
    56: 'Binance Smart Chain',
    97: 'BSC Testnet',
    42161: 'Arbitrum One',
    421613: 'Arbitrum Goerli'
  };
  return networks[chainId] || `Chain ID ${chainId}`;
};

// Get supported networks from the contract ABI
const getSupportedNetworks = () => {
  return Object.keys(ComputeMarketplaceABI.networks).map(id => ({
    id: parseInt(id),
    name: getNetworkName(parseInt(id))
  }));
};

export const ContractProvider = ({ children }) => {
  const { isConnected, walletAddress, chainId } = useWallet();
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  
  // Supported networks for this contract
  const supportedNetworks = getSupportedNetworks();

  // Initialize contract when wallet is connected and chainId changes
  useEffect(() => {
    console.log("Wallet Connection Status:", isConnected);
    console.log("Current Chain ID:", chainId);
    
    if (isConnected && chainId && window.ethereum) {
      console.log("Initializing contract for chain ID:", chainId);
      initializeContract();
    } else {
      setContract(null);
      setContractAddress(null);
      setNetworkError(null);
    }
  }, [isConnected, chainId]);

  // Initialize the contract
  const initializeContract = async () => {
    try {
      // Reset network error
      setNetworkError(null);
      
      // Get the contract address for the current network
      const networkId = chainId.toString();
      console.log("Looking for contract on network ID:", networkId);
      
      const contractNetworkData = ComputeMarketplaceABI.networks[networkId];
      console.log("Contract network data:", contractNetworkData);
      
      if (!contractNetworkData) {
        const supportedNetworkNames = supportedNetworks
          .map(network => network.name)
          .join(', ');
        
        const currentNetwork = getNetworkName(chainId);
        const errorMsg = `Contract not deployed on ${currentNetwork}. Please switch to one of the supported networks: ${supportedNetworkNames}`;
        
        console.error(errorMsg);
        setNetworkError(errorMsg);
        setContract(null);
        setContractAddress(null);
        return;
      }
      
      const contractAddress = contractNetworkData.address;
      console.log("Contract address from ABI:", contractAddress);
      
      // Validate contract address (should not be zero address)
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        const errorMsg = `Invalid contract address for network ${getNetworkName(chainId)}`;
        console.error(errorMsg);
        setNetworkError(errorMsg);
        setContract(null);
        setContractAddress(null);
        return;
      }
      
      setContractAddress(contractAddress);
      
      // Create web3 instance and contract
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(
        ComputeMarketplaceABI.abi,
        contractAddress
      );
      
      setContract(contractInstance);
      console.log(`Contract initialized at address ${contractAddress} on ${getNetworkName(chainId)}`);
    } catch (error) {
      console.error("Error initializing contract:", error);
      setNetworkError(`Failed to initialize contract: ${error.message}`);
      setContract(null);
      setContractAddress(null);
    }
  };

  // Switch to a supported network
  const switchToSupportedNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      console.log("Trying to switch to Sepolia network");
      
      // Hard-code Sepolia for reliability
      const sepoliaChainId = '0xaa36a7'; // 11155111 in decimal
      
      try {
        // Try simple network switch first
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: sepoliaChainId }],
        });
      } catch (switchError) {
        // If network doesn't exist in wallet, try adding it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: sepoliaChainId,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }
            ],
          });
        } else {
          throw switchError;
        }
      }
      
      console.log("Successfully switched to Sepolia network");
      return true;
    } catch (error) {
      console.error("Error switching network:", error);
      return false;
    }
  };

  // Register as provider
  const registerAsProvider = async () => {
    if (!contract || !isConnected) return null;
    if (networkError) {
      console.error("Network error:", networkError);
      return null;
    }
    
    setIsLoading(true);
    try {
      const tx = await contract.methods.registerProvider().send({
        from: walletAddress
      });
      
      setLastTxHash(tx.transactionHash);
      return tx;
    } catch (error) {
      console.error("Error registering as provider:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new job
  const createJob = async (
    dockerUrl,
    maxPricePerHour,
    cpuCores,
    ramGb,
    gpuCount,
    description
  ) => {
    if (!contract || !isConnected) return null;
    if (networkError) {
      console.error("Network error:", networkError);
      return null;
    }
    
    setIsLoading(true);
    try {
      // Convert price to wei
      const web3 = new Web3(window.ethereum);
      const maxPriceWei = web3.utils.toWei(maxPricePerHour.toString(), 'ether');
      
      // Calculate escrow amount (at least 1 hour of max price)
      const escrowAmount = maxPriceWei;
      
      const tx = await contract.methods.createJob(
        dockerUrl,
        maxPriceWei,
        cpuCores,
        ramGb,
        gpuCount,
        description
      ).send({
        from: walletAddress,
        value: escrowAmount
      });
      
      setLastTxHash(tx.transactionHash);
      return tx;
    } catch (error) {
      console.error("Error creating job:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Place a bid on a job
  const placeBid = async (jobId, pricePerHour, estimatedHours) => {
    if (!contract || !isConnected) return null;
    
    setIsLoading(true);
    try {
      // Convert price to wei
      const web3 = new Web3(window.ethereum);
      const pricePerHourWei = web3.utils.toWei(pricePerHour.toString(), 'ether');
      
      const tx = await contract.methods.placeBid(
        jobId,
        pricePerHourWei,
        estimatedHours
      ).send({
        from: walletAddress
      });
      
      setLastTxHash(tx.transactionHash);
      return tx;
    } catch (error) {
      console.error("Error placing bid:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Accept a bid
  const acceptBid = async (jobId, bidId) => {
    if (!contract || !isConnected) return null;
    
    setIsLoading(true);
    try {
      const tx = await contract.methods.acceptBid(jobId, bidId).send({
        from: walletAddress
      });
      
      setLastTxHash(tx.transactionHash);
      return tx;
    } catch (error) {
      console.error("Error accepting bid:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Start a job
  const startJob = async (jobId) => {
    if (!contract || !isConnected) return null;
    
    setIsLoading(true);
    try {
      const tx = await contract.methods.startJob(jobId).send({
        from: walletAddress
      });
      
      setLastTxHash(tx.transactionHash);
      return tx;
    } catch (error) {
      console.error("Error starting job:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete a job
  const completeJob = async (jobId) => {
    if (!contract || !isConnected) return null;
    
    setIsLoading(true);
    try {
      const tx = await contract.methods.completeJob(jobId).send({
        from: walletAddress
      });
      
      setLastTxHash(tx.transactionHash);
      return tx;
    } catch (error) {
      console.error("Error completing job:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a job
  const cancelJob = async (jobId) => {
    if (!contract || !isConnected) return null;
    
    setIsLoading(true);
    try {
      const tx = await contract.methods.cancelJob(jobId).send({
        from: walletAddress
      });
      
      setLastTxHash(tx.transactionHash);
      return tx;
    } catch (error) {
      console.error("Error cancelling job:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get client jobs
  const getClientJobs = async (clientAddress) => {
    if (!contract) return [];
    
    try {
      const address = clientAddress || walletAddress;
      if (!address) return [];
      
      const jobIds = await contract.methods.getClientJobs(address).call();
      const jobs = await Promise.all(
        jobIds.map(async (id) => {
          const jobData = await contract.methods.jobs(id).call();
          return { id, ...jobData };
        })
      );
      
      return jobs;
    } catch (error) {
      console.error("Error fetching client jobs:", error);
      return [];
    }
  };

  // Get provider jobs
  const getProviderJobs = async (providerAddress) => {
    if (!contract) return [];
    
    try {
      const address = providerAddress || walletAddress;
      if (!address) return [];
      
      const jobIds = await contract.methods.getProviderJobs(address).call();
      const jobs = await Promise.all(
        jobIds.map(async (id) => {
          const jobData = await contract.methods.jobs(id).call();
          return { id, ...jobData };
        })
      );
      
      return jobs;
    } catch (error) {
      console.error("Error fetching provider jobs:", error);
      return [];
    }
  };

  // Get job bids
  const getJobBids = async (jobId) => {
    if (!contract) return [];
    
    try {
      const bidIds = await contract.methods.getJobBids(jobId).call();
      const bids = await Promise.all(
        bidIds.map(async (id) => {
          const bidData = await contract.methods.bids(id).call();
          return { id, ...bidData };
        })
      );
      
      return bids;
    } catch (error) {
      console.error("Error fetching job bids:", error);
      return [];
    }
  };

  // Check if address is registered as provider
  const isRegisteredProvider = async (address) => {
    if (!contract) return false;
    
    try {
      const providerAddress = address || walletAddress;
      if (!providerAddress) return false;
      
      return await contract.methods.registeredProviders(providerAddress).call();
    } catch (error) {
      console.error("Error checking provider status:", error);
      return false;
    }
  };

  // Get job details
  const getJobDetails = async (jobId) => {
    if (!contract) return null;
    
    try {
      const jobData = await contract.methods.jobs(jobId).call();
      return { id: jobId, ...jobData };
    } catch (error) {
      console.error("Error fetching job details:", error);
      return null;
    }
  };

  // Export the context value
  const value = {
    contract,
    contractAddress,
    isLoading,
    lastTxHash,
    networkError,
    registerAsProvider,
    createJob,
    placeBid,
    acceptBid,
    startJob,
    completeJob,
    cancelJob,
    getClientJobs,
    getProviderJobs,
    getJobBids,
    isRegisteredProvider,
    getJobDetails,
    supportedNetworks,
    switchToSupportedNetwork
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export default ContractContext; 