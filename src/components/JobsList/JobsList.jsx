import React, { useState } from 'react';
import JobCard from '../JobCard/JobCard';
import './JobsList.css';

const JobsList = ({ jobs, isUserView, onAcceptBid, onPlaceBid }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Filter jobs by status
  const filteredJobs = jobs.filter(job => {
    if (filterStatus === 'all') return true;
    return job.status === filterStatus;
  });
  
  // Sort filtered jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.dateSubmitted) - new Date(a.dateSubmitted);
    }
    if (sortBy === 'oldest') {
      return new Date(a.dateSubmitted) - new Date(b.dateSubmitted);
    }
    if (sortBy === 'price-high') {
      return b.maxPrice - a.maxPrice;
    }
    if (sortBy === 'price-low') {
      return a.maxPrice - b.maxPrice;
    }
    return 0;
  });
  
  return (
    <div className="jobs-list-container">
      <div className="list-controls">
        <div className="filter-controls">
          <span className="control-label">Status:</span>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Awaiting Bids
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </button>
          </div>
        </div>
        
        <div className="sort-controls">
          <span className="control-label">Sort By:</span>
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
          </select>
        </div>
      </div>
      
      {sortedJobs.length > 0 ? (
        <div className="jobs-list">
          {sortedJobs.map(job => (
            <JobCard 
              key={job.id}
              job={job}
              isUserView={isUserView}
              onAcceptBid={onAcceptBid}
              onPlaceBid={onPlaceBid}
            />
          ))}
        </div>
      ) : (
        <div className="no-jobs-message">
          <div className="message-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="message-title">No Jobs Found</h3>
          <p className="message-text">
            {isUserView 
              ? "You haven't submitted any jobs yet."
              : "There are no available jobs matching your filters."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default JobsList; 