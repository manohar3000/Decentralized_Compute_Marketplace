import React, { useState, useEffect } from 'react';
import './Navbar.css';
import WalletConnect from '../WalletConnect/WalletConnect';

const Navbar = ({ navigateTo, currentPage, userType, toggleUserType }) => {
  const [scrolled, setScrolled] = useState(false);
  
  // Add shadow to navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigateTo('landing')}>
          <span className="logo-text">Compute</span>
          <span className="logo-text accent">Market</span>
        </div>
        
        <div className="navbar-links">
          <button 
            className={`nav-link ${currentPage === 'submit-job' ? 'active' : ''}`} 
            onClick={() => navigateTo('submit-job')}
          >
            Submit Job
          </button>
          
          <button 
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`} 
            onClick={() => navigateTo('dashboard')}
          >
            {userType === 'client' ? 'My Jobs' : 'Available Jobs'}
          </button>
          
          <button 
            className="user-type-toggle"
            onClick={toggleUserType}
          >
            Switch to {userType === 'client' ? 'Provider' : 'Client'} View
          </button>
          
          <div className="wallet-wrapper">
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 