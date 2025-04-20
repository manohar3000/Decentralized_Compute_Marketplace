import React, { useState } from 'react';
import './JobCard.css';
import BidModal from '../BidModal/BidModal';

const JobCard = ({ job, isUserView, onAcceptBid, onPlaceBid }) => {
  const [showBidModal, setShowBidModal] = useState(false);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format status with color
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { text: 'Awaiting Bids', class: 'status-pending' },
      active: { text: 'In Progress', class: 'status-active' },
      completed: { text: 'Completed', class: 'status-completed' },
      failed: { text: 'Failed', class: 'status-failed' }
    };
    
    return statusMap[status] || { text: status, class: '' };
  };
  
  const statusDisplay = getStatusDisplay(job.status);
  
  // Toggle bid modal
  const toggleBidModal = () => {
    setShowBidModal(!showBidModal);
  };
  
  // Handle placing a bid (for providers)
  const handlePlaceBid = (bidData) => {
    onPlaceBid(job.id, bidData);
    setShowBidModal(false);
  };
  
  return (
    <div className="job-card">
      <div className="job-header">
        <div className="job-title-section">
          <h3 className="job-title">Job #{job.id.substring(0, 8)}</h3>
          <span className={`job-status ${statusDisplay.class}`}>
            {statusDisplay.text}
          </span>
        </div>
        <div className="job-date">
          {formatDate(job.dateSubmitted)}
        </div>
      </div>
      
      <div className="job-details">
        <div className="job-detail">
          <span className="detail-label">Docker Image:</span>
          <span className="detail-value">{job.dockerUrl}</span>
        </div>
        
        <div className="job-detail">
          <span className="detail-label">Resources:</span>
          <span className="detail-value">
            <span className="resource-badge">{job.cpu} CPU</span>
            <span className="resource-badge">{job.ram} GB RAM</span>
            {job.gpu > 0 && (
              <span className="resource-badge">{job.gpu} GPU</span>
            )}
          </span>
        </div>
        
        <div className="job-detail">
          <span className="detail-label">
            {isUserView ? 'Max Price:' : 'Budget:'}
          </span>
          <span className="detail-value price-value">
            ${job.maxPrice}/hr
          </span>
        </div>
        
        {job.description && (
          <div className="job-description">
            <p>{job.description}</p>
          </div>
        )}
      </div>
      
      {isUserView && job.bids && job.bids.length > 0 && (
        <div className="bids-section">
          <h4 className="bids-title">Bids ({job.bids.length})</h4>
          <div className="bids-list">
            {job.bids.map((bid, index) => (
              <div key={index} className="bid-item">
                <div className="bid-details">
                  <div className="bid-provider">
                    <span className="provider-name">{bid.providerName}</span>
                    <span className="provider-rating">★ {bid.providerRating}</span>
                  </div>
                  <div className="bid-info">
                    <span className="bid-price">${bid.price}/hr</span>
                    <span className="bid-time">{bid.estimatedTime} hours</span>
                  </div>
                </div>
                {job.status === 'pending' && (
                  <button 
                    className="btn btn-primary accept-btn"
                    onClick={() => onAcceptBid(job.id, bid.id)}
                  >
                    Accept
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="job-actions">
        {!isUserView && job.status === 'pending' && (
          <button 
            className="btn btn-primary"
            onClick={toggleBidModal}
          >
            Place Bid
          </button>
        )}
        
        {isUserView && job.status === 'active' && (
          <div className="job-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${job.progress || 0}%` }}
              ></div>
            </div>
            <span className="progress-text">{job.progress || 0}% Complete</span>
          </div>
        )}
      </div>
      
      {showBidModal && (
        <BidModal 
          job={job} 
          onClose={toggleBidModal} 
          onSubmit={handlePlaceBid}
        />
      )}
    </div>
  );
};

export default JobCard; 