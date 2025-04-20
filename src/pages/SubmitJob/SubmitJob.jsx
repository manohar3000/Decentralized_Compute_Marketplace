import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobForm from '../../components/JobForm/JobForm';
import { useWallet } from '../../contexts/WalletContext';
import { useContract } from '../../contexts/ContractContext';
import NetworkDebug from '../../components/NetworkDebug';
import './SubmitJob.css';

const SubmitJob = ({ navigateTo }) => {
  const { isConnected } = useWallet();
  const { createJob, isLoading, lastTxHash, networkError, switchToSupportedNetwork, contractAddress } = useContract();
  const [submittedJob, setSubmittedJob] = useState(null);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  // Reset error when network error changes
  useEffect(() => {
    if (networkError) {
      setError(networkError);
    }
  }, [networkError]);

  const handleSubmit = async (jobData) => {
    // Reset states
    setError('');
    setSubmittedJob(null);
    console.log("Submitting job, checking connection status...");
    
    // Check if connected to wallet
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    console.log("Wallet connected, checking for network errors...");
    
    // Check for network errors
    if (networkError) {
      setError(networkError);
      return;
    }
    console.log("No network errors, checking contract availability...");
    
    // Check if contract is available
    if (!contractAddress) {
      console.error("Contract address is null or undefined");
      setError('Contract is not available on this network. Please switch to Sepolia Testnet and reload the page.');
      return;
    }
    console.log("Contract available at:", contractAddress);
    
    try {
      // Map form data to contract parameters
      const maxPricePerHour = jobData.maxPrice.toString();
      const cpuCores = Math.floor(jobData.cpu);
      const ramGb = Math.floor(jobData.ram);
      const gpuCount = Math.floor(jobData.gpu);
      
      // Log the job data
      console.log('Submitting job to contract:', {
        dockerUrl: jobData.dockerUrl,
        maxPricePerHour,
        cpuCores,
        ramGb,
        gpuCount,
        description: jobData.description
      });
      
      // Submit job to blockchain
      const result = await createJob(
        jobData.dockerUrl,
        maxPricePerHour,
        cpuCores,
        ramGb,
        gpuCount,
        jobData.description
      );
      
      if (result) {
        console.log('Transaction successful:', result);
        setSubmittedJob({
          ...jobData,
          maxPricePerHour,
          cpuCores,
          ramGb,
          gpuCount,
          transactionHash: lastTxHash
        });
      } else {
        setError('Transaction failed or was rejected. Check your wallet for details.');
      }
    } catch (err) {
      console.error('Error submitting job:', err);
      
      // Provide more specific error messages
      if (err.message && err.message.includes("gas")) {
        setError('Transaction failed: Not enough gas or gas estimate failed. Try reducing values or increasing gas limit in your wallet.');
      } else if (err.message && err.message.includes("user rejected")) {
        setError('Transaction was rejected by user. Please try again if you want to submit the job.');
      } else if (err.message && err.message.toLowerCase().includes("insufficient funds")) {
        setError('Insufficient funds in your wallet. Make sure you have enough ETH to cover the job price and gas fees.');
      } else {
        setError(err.message || 'Error submitting job. Please try again.');
      }
    }
  };

  const handleSwitchNetwork = async () => {
    const success = await switchToSupportedNetwork();
    if (!success) {
      setError('Failed to switch network. Please try manually in your wallet.');
    }
  };

  return (
    <div className="submit-job-container">
      <h1>Submit a New Computing Job</h1>
      
      <button 
        onClick={() => setShowDebug(!showDebug)}
        style={{
          padding: '8px 16px',
          marginBottom: '15px',
          backgroundColor: 'transparent',
          color: '#666',
          border: '1px solid #666',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {showDebug ? 'Hide Network Debug' : 'Show Network Debug'}
      </button>
      
      {showDebug && <NetworkDebug />}
      
      {networkError && (
        <div className="error-banner">
          <p>{networkError}</p>
          <button onClick={handleSwitchNetwork} className="switch-network-btn">
            Switch to Sepolia Testnet
          </button>
        </div>
      )}
      
      {error && !networkError && <div className="error-banner">{error}</div>}
      
      {submittedJob ? (
        <div className="success-container">
          <h2>Job Submitted Successfully!</h2>
          {lastTxHash && (
            <div className="transaction-hash">
              <p>Transaction Hash:</p>
              <a 
                href={`https://sepolia.etherscan.io/tx/${lastTxHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {lastTxHash}
              </a>
            </div>
          )}
          <div className="job-summary">
            <h3>Job Summary:</h3>
            <p><strong>Docker URL:</strong> {submittedJob.dockerUrl}</p>
            <p><strong>CPU Cores:</strong> {submittedJob.cpuCores}</p>
            <p><strong>RAM (GB):</strong> {submittedJob.ramGb}</p>
            <p><strong>GPU Count:</strong> {submittedJob.gpuCount}</p>
            <p><strong>Max Price:</strong> {submittedJob.maxPricePerHour} ETH/hour</p>
            <p><strong>Description:</strong> {submittedJob.description || 'N/A'}</p>
          </div>
          <div className="action-buttons">
            <button onClick={() => navigateTo('dashboard')}>View My Jobs</button>
            <button onClick={() => setSubmittedJob(null)}>Submit Another Job</button>
          </div>
        </div>
      ) : (
        <JobForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}
    </div>
  );
};

export default SubmitJob; 