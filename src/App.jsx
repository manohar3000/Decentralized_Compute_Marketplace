import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage/LandingPage';
import SubmitJob from './pages/SubmitJob/SubmitJob';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard/ProviderDashboard';
import Navbar from './components/Navbar/Navbar';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [userType, setUserType] = useState('client'); // 'client' or 'provider'
  const [hasWallet, setHasWallet] = useState(false);

  // Check if wallet is available
  useEffect(() => {
    setHasWallet(!!window.ethereum);
  }, []);

  // Simple routing function
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Toggle user type
  const toggleUserType = () => {
    setUserType(userType === 'client' ? 'provider' : 'client');
  };

  // Render current page based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage navigateTo={navigateTo} />;
      case 'submit-job':
        return <SubmitJob navigateTo={navigateTo} />;
      case 'dashboard':
        return userType === 'client' ? 
          <UserDashboard navigateTo={navigateTo} /> : 
          <ProviderDashboard navigateTo={navigateTo} />;
      default:
        return <LandingPage navigateTo={navigateTo} />;
    }
  };

  return (
    <WalletProvider>
      <ContractProvider>
        <div className="app">
          <Navbar 
            navigateTo={navigateTo} 
            currentPage={currentPage} 
            userType={userType}
            toggleUserType={toggleUserType}
          />
          {!hasWallet && currentPage !== 'landing' && (
            <div className="wallet-warning">
              <p>No Web3 wallet detected. Please install MetaMask or another compatible wallet to use all features.</p>
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="install-wallet-link">
                Install MetaMask
              </a>
            </div>
          )}
          <main className="main-content">
            {renderPage()}
          </main>
        </div>
      </ContractProvider>
    </WalletProvider>
  );
}

export default App; 