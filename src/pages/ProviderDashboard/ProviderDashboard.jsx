import React, { useState, useEffect } from 'react';
import JobsList from '../../components/JobsList/JobsList';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import './ProviderDashboard.css';
import Web3 from 'web3';

const ProviderDashboard = ({ navigateTo }) => {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const { isConnected, walletAddress, formatAddress, connectWallet } = useWallet();
  const { 
    getProviderJobs, 
    placeBid, 
    registerAsProvider,
    isRegisteredProvider,
    networkError, 
    isLoading: contractLoading,
    getOpenJobs
  } = useContract();
  
  const [isProvider, setIsProvider] = useState(false);

  // Check if user is registered as provider
  useEffect(() => {
    const checkProviderStatus = async () => {
      if (!isConnected || !walletAddress) {
        setIsProvider(false);
        return;
      }
      
      try {
        const providerStatus = await isRegisteredProvider(walletAddress);
        setIsProvider(providerStatus);
      } catch (error) {
        console.error("Error checking provider status:", error);
        setIsProvider(false);
      }
    };
    
    checkProviderStatus();
  }, [isConnected, walletAddress, isRegisteredProvider]);

  // Fetch jobs from blockchain when wallet is connected
  useEffect(() => {
    const fetchJobs = async () => {
      if (!isConnected || !walletAddress) {
        setMyJobs([]);
        setAvailableJobs([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch provider's own jobs
        const providerJobsData = await getProviderJobs(walletAddress);
        console.log("Provider jobs data:", providerJobsData);
        
        // Format provider jobs for display
        const web3 = new Web3(window.ethereum);
        
        const formattedProviderJobs = providerJobsData.map(job => {
          // Convert job status from enum (0, 1, 2, 3) to string
          const statusMap = ['pending', 'active', 'completed', 'cancelled'];
          const status = statusMap[job.status] || 'unknown';
          
          // Convert numeric values from wei to ETH and timestamps to dates
          return {
            id: job.id,
            dockerUrl: job.dockerUrl,
            maxPrice: web3.utils.fromWei(job.maxPricePerHour, 'ether'),
            cpu: parseInt(job.cpuCores),
            ram: parseInt(job.ramGb),
            gpu: parseInt(job.gpuCount),
            description: job.description,
            status: status,
            dateSubmitted: new Date(job.createdAt * 1000).toISOString(),
            provider: job.provider,
            client: job.client,
            acceptedBidId: job.acceptedBidId !== "0" ? job.acceptedBidId : null,
            startTime: job.startTime !== "0" ? new Date(job.startTime * 1000).toISOString() : null,
            endTime: job.endTime !== "0" ? new Date(job.endTime * 1000).toISOString() : null
          };
        });
        
        setMyJobs(formattedProviderJobs);
        
        // In a real implementation, you would fetch available jobs from the contract
        const openJobsData = await getOpenJobs(); // Fetch open jobs from the contract
        const formattedOpenJobs = openJobsData.map(job => {
          // Convert job status from enum (0, 1, 2, 3) to string
          const statusMap = ['pending', 'active', 'completed', 'cancelled'];
          const status = statusMap[job.status] || 'unknown';
          
          // Convert numeric values from wei to ETH and timestamps to dates
          return {
            id: job.id,
            dockerUrl: job.dockerUrl,
            maxPrice: web3.utils.fromWei(job.maxPricePerHour, 'ether'),
            cpu: parseInt(job.cpuCores),
            ram: parseInt(job.ramGb),
            gpu: parseInt(job.gpuCount),
            description: job.description,
            status: status,
            dateSubmitted: new Date(job.createdAt * 1000).toISOString(),
            provider: job.provider,
            client: job.client,
            acceptedBidId: job.acceptedBidId !== "0" ? job.acceptedBidId : null,
            startTime: job.startTime !== "0" ? new Date(job.startTime * 1000).toISOString() : null,
            endTime: job.endTime !== "0" ? new Date(job.endTime * 1000).toISOString() : null
          };
        });
        
        // Filter out jobs that the provider already has
        const providerJobIds = formattedProviderJobs.map(job => job.id);
        const filteredAvailableJobs = formattedOpenJobs.filter(job => 
          !providerJobIds.includes(job.id)
        );
        
        setAvailableJobs(filteredAvailableJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [isConnected, walletAddress, getProviderJobs, getOpenJobs]);
  
  const handleRegisterProvider = async () => {
    try {
      setLoading(true);
      
      // Call contract method to register as provider
      const result = await registerAsProvider();
      
      if (result) {
        console.log("Successfully registered as provider:", result);
        setIsProvider(true);
      } else {
        console.error("Failed to register as provider");
      }
    } catch (error) {
      console.error("Error registering as provider:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePlaceBid = async (jobId, bidData) => {
    // Require wallet connection to place bid
    if (!isConnected) {
      alert('Please connect your wallet to place a bid');
      return;
    }
    
    // Require provider registration
    if (!isProvider) {
      alert('You need to register as a provider first');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log("Placing bid for job:", jobId, bidData);
      
      // Call contract method to place bid
      const result = await placeBid(
        jobId, 
        bidData.price.toString(),
        bidData.estimatedTime
      );
      
      if (result) {
        console.log("Bid placed successfully:", result);
        
        // Remove job from available jobs
        setAvailableJobs(prev => prev.filter(job => job.id !== jobId));
        
        // Add to my jobs with pending status
        const jobToBid = availableJobs.find(job => job.id === jobId);
        if (jobToBid) {
          const updatedJob = {
            ...jobToBid,
            status: 'pending',
            myBid: {
              price: bidData.price,
              estimatedTime: bidData.estimatedTime
            }
          };
          
          setMyJobs(prev => [updatedJob, ...prev]);
          
          // Switch to my jobs tab
          setActiveTab('my');
        }
      } else {
        console.error("Failed to place bid");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      alert(`Error placing bid: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="provider-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Provider Dashboard</h1>
          
          {isConnected ? (
            <div className="provider-wallet-info">
              <span className="provider-label">Provider:</span>
              <span className="provider-address">{formatAddress(walletAddress)}</span>
              {!isProvider && (
                <button className="register-provider-btn" onClick={handleRegisterProvider} disabled={contractLoading}>
                  {contractLoading ? 'Registering...' : 'Register as Provider'}
                </button>
              )}
            </div>
          ) : (
            <button className="btn provider-connect-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <span className="stat-value">{myJobs.filter(job => job.status === 'active').length}</span>
              <span className="stat-label">Active Jobs</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{availableJobs.length}</span>
              <span className="stat-label">Available Jobs</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{myJobs.filter(job => job.status === 'completed').length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Jobs
          </button>
          <button
            className={`tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Jobs
          </button>
        </div>
        
        {!isConnected ? (
          <div className="wallet-notice">
            <p>You need to connect your wallet to view and accept jobs.</p>
            <button className="btn btn-primary" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        ) : loading || contractLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading jobs from blockchain...</p>
          </div>
        ) : networkError ? (
          <div className="error-message">
            <p>{networkError}</p>
            <p>Please connect to the correct network to view jobs.</p>
          </div>
        ) : (
          <div className="dashboard-content">
            {!isProvider && activeTab === 'my' ? (
              <div className="provider-notice">
                <p>You need to register as a provider to accept jobs.</p>
                <button className="btn btn-primary" onClick={handleRegisterProvider}>
                  Register as Provider
                </button>
              </div>
            ) : (
              activeTab === 'available' ? (
                <JobsList 
                  jobs={availableJobs}
                  isUserView={false}
                  onPlaceBid={handlePlaceBid}
                />
              ) : (
                <JobsList 
                  jobs={myJobs}
                  isUserView={false}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard; 