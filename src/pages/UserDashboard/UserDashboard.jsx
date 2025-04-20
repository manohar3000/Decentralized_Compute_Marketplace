import React, { useState, useEffect } from 'react';
import JobsList from '../../components/JobsList/JobsList';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import Web3 from 'web3';
import './UserDashboard.css';

const UserDashboard = ({ navigateTo }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, walletAddress } = useWallet();
  const { getClientJobs, acceptBid, networkError, isLoading: contractLoading } = useContract();
  
  // Fetch jobs from blockchain when wallet is connected
  useEffect(() => {
    const fetchJobs = async () => {
      if (!isConnected || !walletAddress) {
        setJobs([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching client jobs for address:", walletAddress);
        
        const jobsData = await getClientJobs(walletAddress);
        console.log("Jobs data from contract:", jobsData);
        
        // Format jobs for display
        const formattedJobs = jobsData.map(job => {
          // Convert job status from enum (0, 1, 2, 3) to string
          const statusMap = ['pending', 'active', 'completed', 'cancelled'];
          const status = statusMap[job.status] || 'unknown';
          
          // Convert numeric values from wei to ETH and timestamps to dates
          const web3 = new Web3(window.ethereum);
          
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
            acceptedBidId: job.acceptedBidId !== "0" ? job.acceptedBidId : null,
            startTime: job.startTime !== "0" ? new Date(job.startTime * 1000).toISOString() : null,
            endTime: job.endTime !== "0" ? new Date(job.endTime * 1000).toISOString() : null,
            client: job.client,
            // Add empty bids array that can be populated later
            bids: []
          };
        });
        
        setJobs(formattedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [isConnected, walletAddress, getClientJobs]);
  
  const handleAcceptBid = async (jobId, bidId) => {
    try {
      setLoading(true);
      console.log(`Accepting bid ${bidId} for job ${jobId}`);
      
      // Call contract method to accept bid
      const result = await acceptBid(jobId, bidId);
      
      if (result) {
        console.log("Bid accepted successfully:", result);
        
        // Update job status in local state
        setJobs(prevJobs => 
          prevJobs.map(job => {
            if (job.id === jobId) {
              return {
                ...job,
                status: 'active',
                acceptedBidId: bidId
              };
            }
            return job;
          })
        );
      } else {
        console.error("Failed to accept bid");
      }
    } catch (error) {
      console.error("Error accepting bid:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Compute Jobs</h1>
          <button 
            className="btn btn-primary"
            onClick={() => navigateTo('submit-job')}
          >
            Submit New Job
          </button>
        </div>
        
        {!isConnected ? (
          <div className="connect-wallet-prompt">
            <p>Please connect your wallet to view your jobs</p>
          </div>
        ) : loading || contractLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your jobs from blockchain...</p>
          </div>
        ) : networkError ? (
          <div className="error-message">
            <p>{networkError}</p>
            <p>Please connect to the correct network to view your jobs.</p>
          </div>
        ) : (
          <div className="dashboard-content">
            <JobsList 
              jobs={jobs}
              isUserView={true}
              onAcceptBid={handleAcceptBid}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 