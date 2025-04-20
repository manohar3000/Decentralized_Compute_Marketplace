# Decentralized Compute Marketplace

A modern frontend for a decentralized marketplace where users can submit Docker container compute jobs and providers can bid on these jobs.

## Features

- **User Features**:
  - Submit compute jobs with Docker Hub URLs
  - Specify computing requirements (CPU, RAM, GPU)
  - Set maximum price willing to pay
  - View and accept provider bids
  - Track job status and progress

- **Provider Features**:
  - Browse available jobs
  - Place bids with price and time estimates
  - View active and completed jobs

## Tech Stack

- React 18 with JSX
- Vite for fast development and building
- CSS-in-JS with separate component stylesheets
- Responsive design for all devices

## Running the Project

### Prerequisites

- Node.js 16+ installed
- npm or yarn

### Setup Instructions

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd decentralized-compute-marketplace
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── JobForm/
│   ├── JobCard/
│   ├── BidModal/
│   ├── Hero/
│   ├── Navbar/
│   └── JobsList/
├── pages/
│   ├── LandingPage/
│   ├── SubmitJob/
│   ├── UserDashboard/
│   └── ProviderDashboard/
├── App.jsx
└── main.jsx
```

## Demo Screenshots

[Screenshots would be added here]

## Future Enhancements

- Integration with real blockchain-based marketplaces
- User authentication and provider verification
- Job history and analytics
- Real-time notifications for bids and job status updates
- Integration with popular container orchestration platforms

## License

MIT 