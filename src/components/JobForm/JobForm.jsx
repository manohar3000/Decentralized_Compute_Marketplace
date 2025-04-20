import React, { useState } from 'react';
import './JobForm.css';

const JobForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    dockerUrl: '',
    maxPrice: '',
    cpu: 2,
    ram: 4,
    gpu: 0,
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert number inputs to numbers
    const parsedValue = ['cpu', 'ram', 'gpu', 'maxPrice'].includes(name) 
      ? parseFloat(value) 
      : value;
      
    setFormData({
      ...formData,
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
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.dockerUrl) {
      newErrors.dockerUrl = 'Docker Hub URL is required';
    } else if (!formData.dockerUrl.includes('docker.io') && !formData.dockerUrl.includes('hub.docker.com')) {
      newErrors.dockerUrl = 'Please enter a valid Docker Hub URL';
    }
    
    if (!formData.maxPrice) {
      newErrors.maxPrice = 'Maximum price is required';
    } else if (formData.maxPrice <= 0) {
      newErrors.maxPrice = 'Price must be greater than 0';
    }
    
    if (formData.cpu < 1 || formData.cpu > 255) {
      newErrors.cpu = 'CPU cores must be between 1 and 255';
    }
    
    if (formData.ram < 1 || formData.ram > 255) {
      newErrors.ram = 'RAM must be between 1 and 255 GB';
    }
    
    if (formData.gpu < 0 || formData.gpu > 255) {
      newErrors.gpu = 'GPU count must be between 0 and 255';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm() && !isLoading) {
      onSubmit({
        dockerUrl: formData.dockerUrl,
        maxPrice: formData.maxPrice,
        cpu: Math.floor(formData.cpu),
        ram: Math.floor(formData.ram),
        gpu: Math.floor(formData.gpu),
        description: formData.description
      });
    }
  };
  
  return (
    <div className="job-form-container">
      <form className="job-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Submit New Compute Job</h2>
        
        <div className="form-group">
          <label htmlFor="dockerUrl">Docker Hub Image URL <span className="required">*</span></label>
          <input
            type="text"
            id="dockerUrl"
            name="dockerUrl"
            value={formData.dockerUrl}
            onChange={handleChange}
            placeholder="e.g., docker.io/username/image:tag"
            className={errors.dockerUrl ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.dockerUrl && <span className="error-message">{errors.dockerUrl}</span>}
          <small className="field-hint">URL to your Docker image that will be run by providers</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Job Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what your job does, any special requirements, etc."
            rows="3"
            disabled={isLoading}
          />
          <small className="field-hint">Provide details about your job to help providers understand requirements</small>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="maxPrice">Maximum Price (ETH/hr) <span className="required">*</span></label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={formData.maxPrice}
              onChange={handleChange}
              min="0.001"
              step="0.001"
              placeholder="0.01"
              className={errors.maxPrice ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.maxPrice && <span className="error-message">{errors.maxPrice}</span>}
            <small className="price-note">This amount will be used as escrow deposit. Make sure you have enough ETH in your wallet.</small>
          </div>
        </div>
        
        <div className="resources-section">
          <h3 className="resources-title">Compute Resources</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cpu">CPU Cores <span className="required">*</span></label>
              <div className="resource-slider-container">
                <input
                  type="range"
                  id="cpu"
                  name="cpu"
                  min="1"
                  max="16"
                  value={formData.cpu}
                  onChange={handleChange}
                  className="resource-slider"
                  disabled={isLoading}
                />
                <div className="resource-value">{formData.cpu}</div>
              </div>
              {errors.cpu && <span className="error-message">{errors.cpu}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ram">RAM (GB) <span className="required">*</span></label>
              <div className="resource-slider-container">
                <input
                  type="range"
                  id="ram"
                  name="ram"
                  min="1"
                  max="64"
                  value={formData.ram}
                  onChange={handleChange}
                  className="resource-slider"
                  disabled={isLoading}
                />
                <div className="resource-value">{formData.ram}</div>
              </div>
              {errors.ram && <span className="error-message">{errors.ram}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gpu">GPU Units</label>
              <div className="resource-slider-container">
                <input
                  type="range"
                  id="gpu"
                  name="gpu"
                  min="0"
                  max="4"
                  value={formData.gpu}
                  onChange={handleChange}
                  className="resource-slider"
                  disabled={isLoading}
                />
                <div className="resource-value">{formData.gpu}</div>
              </div>
              {errors.gpu && <span className="error-message">{errors.gpu}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className={`btn btn-primary submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Submitting to Blockchain...
              </>
            ) : (
              'Submit Job'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm; 