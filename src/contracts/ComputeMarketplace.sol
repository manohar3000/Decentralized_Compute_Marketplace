// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ComputeMarketplace
 * @dev Main contract for the decentralized compute marketplace
 */
contract ComputeMarketplace {
    // ============ Structs ============
    
    struct Job {
        address client;
        string dockerUrl;
        uint256 maxPricePerHour;
        uint8 cpuCores;
        uint8 ramGb;
        uint8 gpuCount;
        string description;
        JobStatus status;
        uint256 createdAt;
        address provider;
        uint256 acceptedBidId;
        uint256 startTime;
        uint256 endTime;
    }
    
    struct Bid {
        uint256 jobId;
        address provider;
        uint256 pricePerHour;
        uint8 estimatedHours;
        uint256 createdAt;
        BidStatus status;
    }
    
    // ============ Enums ============
    
    enum JobStatus {
        Open,       // Job is open for bids
        InProgress, // Job has been accepted by a provider and is running
        Completed,  // Job has been completed
        Cancelled   // Job has been cancelled
    }
    
    enum BidStatus {
        Active,    // Bid is active
        Accepted,  // Bid has been accepted
        Rejected,  // Bid has been rejected
        Cancelled  // Bid has been cancelled
    }
    
    // ============ Events ============
    
    event JobCreated(uint256 indexed jobId, address indexed client, uint256 maxPricePerHour);
    event JobAccepted(uint256 indexed jobId, address indexed provider, uint256 bidId);
    event JobStarted(uint256 indexed jobId, uint256 startTime);
    event JobCompleted(uint256 indexed jobId, uint256 endTime, uint256 totalPayment);
    event JobCancelled(uint256 indexed jobId);
    
    event BidPlaced(uint256 indexed bidId, uint256 indexed jobId, address indexed provider, uint256 pricePerHour);
    event BidAccepted(uint256 indexed bidId, uint256 indexed jobId);
    event BidRejected(uint256 indexed bidId, uint256 indexed jobId);
    
    event ProviderRegistered(address indexed provider);
    event PaymentReleased(uint256 indexed jobId, address indexed provider, uint256 amount);
    
    // ============ State Variables ============
    
    uint256 private nextJobId = 1;
    uint256 private nextBidId = 1;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Bid) public bids;
    mapping(uint256 => uint256[]) public jobBids; // jobId => bidIds
    mapping(address => bool) public registeredProviders;
    mapping(address => uint256[]) public clientJobs; // client => jobIds
    mapping(address => uint256[]) public providerJobs; // provider => jobIds
    
    // Escrow balance for jobs
    mapping(uint256 => uint256) public jobEscrow;
    
    // ============ Modifiers ============
    
    modifier onlyJobClient(uint256 _jobId) {
        require(jobs[_jobId].client == msg.sender, "Only job client can call this function");
        _;
    }
    
    modifier onlyJobProvider(uint256 _jobId) {
        require(jobs[_jobId].provider == msg.sender, "Only job provider can call this function");
        _;
    }
    
    modifier onlyRegisteredProvider() {
        require(registeredProviders[msg.sender], "Only registered providers can call this function");
        _;
    }
    
    modifier jobExists(uint256 _jobId) {
        require(jobs[_jobId].client != address(0), "Job does not exist");
        _;
    }
    
    modifier jobIsOpen(uint256 _jobId) {
        require(jobs[_jobId].status == JobStatus.Open, "Job is not open for bids");
        _;
    }
    
    // ============ Functions ============
    
    /**
     * @dev Register as a compute provider
     */
    function registerProvider() external {
        require(!registeredProviders[msg.sender], "Provider already registered");
        registeredProviders[msg.sender] = true;
        emit ProviderRegistered(msg.sender);
    }
    
    /**
     * @dev Create a new job
     */
    function createJob(
        string calldata _dockerUrl,
        uint256 _maxPricePerHour,
        uint8 _cpuCores,
        uint8 _ramGb,
        uint8 _gpuCount,
        string calldata _description
    ) external payable returns (uint256) {
        require(bytes(_dockerUrl).length > 0, "Docker URL cannot be empty");
        require(_maxPricePerHour > 0, "Max price per hour must be greater than 0");
        require(_cpuCores > 0, "CPU cores must be greater than 0");
        require(_ramGb > 0, "RAM GB must be greater than 0");
        
        // Calculate minimum escrow amount (at least 1 hour of max price)
        uint256 minEscrow = _maxPricePerHour;
        require(msg.value >= minEscrow, "Insufficient escrow amount");
        
        uint256 jobId = nextJobId++;
        
        jobs[jobId] = Job({
            client: msg.sender,
            dockerUrl: _dockerUrl,
            maxPricePerHour: _maxPricePerHour,
            cpuCores: _cpuCores,
            ramGb: _ramGb,
            gpuCount: _gpuCount,
            description: _description,
            status: JobStatus.Open,
            createdAt: block.timestamp,
            provider: address(0),
            acceptedBidId: 0,
            startTime: 0,
            endTime: 0
        });
        
        jobEscrow[jobId] = msg.value;
        clientJobs[msg.sender].push(jobId);
        
        emit JobCreated(jobId, msg.sender, _maxPricePerHour);
        
        return jobId;
    }
    
    /**
     * @dev Place a bid on a job
     */
    function placeBid(
        uint256 _jobId,
        uint256 _pricePerHour,
        uint8 _estimatedHours
    ) external onlyRegisteredProvider jobExists(_jobId) jobIsOpen(_jobId) returns (uint256) {
        require(_pricePerHour > 0, "Price per hour must be greater than 0");
        require(_pricePerHour <= jobs[_jobId].maxPricePerHour, "Price exceeds job's max price");
        require(_estimatedHours > 0, "Estimated hours must be greater than 0");
        
        // Check if enough funds in escrow
        require(jobEscrow[_jobId] >= _pricePerHour * _estimatedHours, "Job escrow too low for this bid");
        
        uint256 bidId = nextBidId++;
        
        bids[bidId] = Bid({
            jobId: _jobId,
            provider: msg.sender,
            pricePerHour: _pricePerHour,
            estimatedHours: _estimatedHours,
            createdAt: block.timestamp,
            status: BidStatus.Active
        });
        
        jobBids[_jobId].push(bidId);
        
        emit BidPlaced(bidId, _jobId, msg.sender, _pricePerHour);
        
        return bidId;
    }
    
    /**
     * @dev Accept a bid for a job
     */
    function acceptBid(
        uint256 _jobId,
        uint256 _bidId
    ) external onlyJobClient(_jobId) jobIsOpen(_jobId) {
        require(bids[_bidId].jobId == _jobId, "Bid is not for this job");
        require(bids[_bidId].status == BidStatus.Active, "Bid is not active");
        
        address provider = bids[_bidId].provider;
        
        jobs[_jobId].status = JobStatus.InProgress;
        jobs[_jobId].provider = provider;
        jobs[_jobId].acceptedBidId = _bidId;
        
        bids[_bidId].status = BidStatus.Accepted;
        
        providerJobs[provider].push(_jobId);
        
        emit BidAccepted(_bidId, _jobId);
        emit JobAccepted(_jobId, provider, _bidId);
    }
    
    /**
     * @dev Start a job (called by provider)
     */
    function startJob(uint256 _jobId) external onlyJobProvider(_jobId) {
        require(jobs[_jobId].status == JobStatus.InProgress, "Job is not in progress");
        require(jobs[_jobId].startTime == 0, "Job already started");
        
        jobs[_jobId].startTime = block.timestamp;
        
        emit JobStarted(_jobId, block.timestamp);
    }
    
    /**
     * @dev Complete a job (can be called by provider)
     */
    function completeJob(uint256 _jobId) external onlyJobProvider(_jobId) {
        require(jobs[_jobId].status == JobStatus.InProgress, "Job is not in progress");
        require(jobs[_jobId].startTime > 0, "Job has not been started");
        
        jobs[_jobId].status = JobStatus.Completed;
        jobs[_jobId].endTime = block.timestamp;
        
        // Calculate payment
        uint256 bidId = jobs[_jobId].acceptedBidId;
        uint256 pricePerHour = bids[bidId].pricePerHour;
        
        // Calculate hours worked (rounded up to nearest hour)
        uint256 hoursWorked = (block.timestamp - jobs[_jobId].startTime + 3599) / 3600;
        uint256 payment = pricePerHour * hoursWorked;
        
        // Cap payment at escrow amount
        if (payment > jobEscrow[_jobId]) {
            payment = jobEscrow[_jobId];
        }
        
        // Transfer payment to provider
        jobEscrow[_jobId] -= payment;
        payable(msg.sender).transfer(payment);
        
        emit PaymentReleased(_jobId, msg.sender, payment);
        emit JobCompleted(_jobId, block.timestamp, payment);
        
        // Return remaining escrow to client if any
        if (jobEscrow[_jobId] > 0) {
            uint256 remainingFunds = jobEscrow[_jobId];
            jobEscrow[_jobId] = 0;
            payable(jobs[_jobId].client).transfer(remainingFunds);
        }
    }
    
    /**
     * @dev Cancel a job (can only be called by client if job is open)
     */
    function cancelJob(uint256 _jobId) external onlyJobClient(_jobId) {
        require(jobs[_jobId].status == JobStatus.Open, "Can only cancel open jobs");
        
        jobs[_jobId].status = JobStatus.Cancelled;
        
        // Return escrow to client
        uint256 escrowAmount = jobEscrow[_jobId];
        jobEscrow[_jobId] = 0;
        payable(msg.sender).transfer(escrowAmount);
        
        emit JobCancelled(_jobId);
    }
    
    /**
     * @dev Add more funds to job escrow
     */
    function addFundsToJob(uint256 _jobId) external payable onlyJobClient(_jobId) {
        require(jobs[_jobId].status == JobStatus.Open || jobs[_jobId].status == JobStatus.InProgress, 
            "Can only add funds to open or in-progress jobs");
        
        jobEscrow[_jobId] += msg.value;
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get all bids for a job
     */
    function getJobBids(uint256 _jobId) external view returns (uint256[] memory) {
        return jobBids[_jobId];
    }
    
    /**
     * @dev Get all jobs posted by a client
     */
    function getClientJobs(address _client) external view returns (uint256[] memory) {
        return clientJobs[_client];
    }
    
    /**
     * @dev Get all jobs assigned to a provider
     */
    function getProviderJobs(address _provider) external view returns (uint256[] memory) {
        return providerJobs[_provider];
    }
} 