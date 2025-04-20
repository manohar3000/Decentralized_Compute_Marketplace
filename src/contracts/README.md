# Compute Marketplace Smart Contract

This directory contains the smart contract for the Decentralized Compute Marketplace.

## Overview

The `ComputeMarketplace.sol` contract provides all the core functionality needed for the marketplace:

- Job posting and management (create, cancel, complete)
- Provider registration and job assignment
- Bidding system for providers to bid on jobs
- Escrow for job payments
- Time-based billing system (per hour)

## Contract Features

### For Clients

- **Create Jobs**: Post compute jobs with resource requirements
- **Fund Jobs**: Deposit ETH to cover the job costs
- **Accept Bids**: Choose a provider from the submitted bids
- **Cancel Jobs**: Cancel jobs that haven't been started

### For Providers

- **Register**: Register as a compute provider
- **Place Bids**: Bid on available jobs
- **Start Jobs**: Signal when job processing begins
- **Complete Jobs**: Mark jobs as completed and receive payment

## Smart Contract Structure

### Key Data Structures

- **Job Struct**: Contains all job details including resource requirements
- **Bid Struct**: Contains bid details including price and estimated completion time
- **Status Enums**: Track the status of jobs and bids

### Core Functions

- `createJob`: Post a new job with funding
- `placeBid`: Submit a bid for a job
- `acceptBid`: Accept a bid and assign the job
- `startJob`: Begin job execution
- `completeJob`: Finish a job and process payment
- `cancelJob`: Cancel an open job

## Deployment

The contract should be deployed to the Ethereum network (mainnet or testnet). Current testnet deployments:

- **Goerli Testnet**: Not yet deployed
- **Sepolia Testnet**: Not yet deployed

## Integration with Frontend

The frontend interacts with the contract through the `ContractContext.jsx` provider, which wraps Web3.js calls to the smart contract.

## Security Considerations

- The contract uses function modifiers to restrict access to sensitive operations
- Job payments are secured in escrow until completion
- The provider can only start a job after the client accepts their bid
- Price validations ensure the client's maximum price is respected

## Future Enhancements

For a more comprehensive implementation, consider adding:

1. Provider reputation system
2. Dispute resolution mechanism
3. Token-based payments
4. More advanced resource specification
5. Multi-signature verification for job completion

## Testing

Before deploying to mainnet, thoroughly test the contract on a testnet using tools like Hardhat or Truffle.

## License

MIT 