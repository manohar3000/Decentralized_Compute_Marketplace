import React, { useState, useEffect, useRef } from 'react';
import './BidModal.css';

const BidModal = ({ job, onClose, onSubmit }) => {
  const [bidData, setBidData] = useState({
    price: '',
    estimatedTime: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  
  // Handle clicking outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert number inputs to numbers
    const parsedValue = ['price', 'estimatedTime'].includes(name) 
      ? parseFloat(value) 
      : value;
      
    setBidData({
      ...bidData,
      [name]: parsedValue
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!bidData.price) {
      newErrors.price = 'Bid price is required';
    } else if (bidData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (bidData.price > job.maxPrice) {
      newErrors.price = `Price must not exceed client's maximum (${job.maxPrice})`;
    }
    
    if (!bidData.estimatedTime) {
      newErrors.estimatedTime = 'Estimated time is required';
    } else if (bidData.estimatedTime <= 0) {
      newErrors.estimatedTime = 'Time must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Add mock provider details
      const completeData = {
        ...bidData,
        id: Date.now().toString(),
        providerName: 'Your Company',
        providerRating: 4.7,
        dateSubmitted: new Date().toISOString()
      };
      
      onSubmit(completeData);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="bid-modal" ref={modalRef}>
        <div className="modal-header">
          <h3 className="modal-title">Place a Bid</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="job-summary">
          <div className="summary-item">
            <span className="summary-label">Job:</span>
            <span className="summary-value">#{job.id.substring(0, 8)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Docker Image:</span>
            <span className="summary-value">{job.dockerUrl}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Client Max Price:</span>
            <span className="summary-value">${job.maxPrice}/hr</span>
          </div>
        </div>
        
        <form className="bid-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Your Hourly Rate ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={bidData.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="estimatedTime">Estimated Time (hours)</label>
              <input
                type="number"
                id="estimatedTime"
                name="estimatedTime"
                value={bidData.estimatedTime}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                placeholder="0.0"
                className={errors.estimatedTime ? 'error' : ''}
              />
              {errors.estimatedTime && <span className="error-message">{errors.estimatedTime}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message to Client (Optional)</label>
            <textarea
              id="message"
              name="message"
              value={bidData.message}
              onChange={handleChange}
              placeholder="Describe your approach, qualifications, or any questions you have..."
              rows="3"
            />
          </div>
          
          <div className="total-estimate">
            <div className="estimate-item">
              <span className="estimate-label">Estimated Total:</span>
              <span className="estimate-value">
                ${bidData.price && bidData.estimatedTime 
                  ? (bidData.price * bidData.estimatedTime).toFixed(2) 
                  : '0.00'}
              </span>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Bid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidModal; 