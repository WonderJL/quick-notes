# Stablecoin Emergency Protocols: Study Guide and Solutions

## Table of Contents
1. [Circuit Breaker Implementation](#circuit-breaker-implementation)
2. [Pause Functionality Design](#pause-functionality-design)
3. [Oracle Failure Handling](#oracle-failure-handling)
4. [Governance in Emergency Protocols](#governance-in-emergency-protocols)
5. [Access Control Patterns](#access-control-patterns)

## Circuit Breaker Implementation

**Learning Focus:** How to implement effective circuit breakers in stablecoin contracts

### Solution Pattern
```solidity
// @notice Implementation of a circuit breaker with thresholds
contract StableCoinWithCircuitBreaker {
    uint256 public constant TRANSFER_THRESHOLD = 1_000_000 * 10**18; // 1M tokens
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    
    mapping(address => uint256) public lastTransferTime;
    mapping(address => uint256) public transferVolume;
    
    // @notice Check if transfer should be allowed
    function _checkCircuitBreaker(
        address from, 
        uint256 amount
    ) internal {
        // Reset volume if cooldown passed
        if (block.timestamp >= lastTransferTime[from] + COOLDOWN_PERIOD) {
            transferVolume[from] = 0;
        }
        
        // Check if new transfer would exceed threshold
        require(
            transferVolume[from] + amount <= TRANSFER_THRESHOLD,
            "Circuit breaker: Transfer limit exceeded"
        );
        
        transferVolume[from] += amount;
        lastTransferTime[from] = block.timestamp;
    }
}
```

### Key Learning Points
1. Implement gradual thresholds rather than complete stops
2. Include cooldown periods to prevent abuse
3. Track transfer volumes per address
4. Consider different thresholds for different operations

## Pause Functionality Design

**Learning Focus:** Best practices for implementing pause mechanisms

### Solution Pattern
```solidity
contract ModularPausable is Pausable {
    // @notice Granular pause flags
    mapping(bytes32 => bool) public pauseFlags;
    
    // @notice Pause specific functionality
    function pauseFunction(bytes32 functionId) external onlyRole(PAUSER_ROLE) {
        pauseFlags[functionId] = true;
        emit FunctionPaused(functionId);
    }
    
    // @notice Check if specific function is paused
    modifier whenFunctionNotPaused(bytes32 functionId) {
        require(
            !pauseFlags[functionId],
            "Function is paused"
        );
        _;
    }
    
    // @notice Example transfer with granular pause
    function transfer(address to, uint256 amount) public 
        whenNotPaused 
        whenFunctionNotPaused("transfer")
    {
        // Transfer logic
    }
}
```

### Key Learning Points
1. Implement granular pause mechanisms
2. Consider recovery procedures
3. Include proper event emissions
4. Implement role-based pause controls

## Oracle Failure Handling

**Learning Focus:** Strategies for handling oracle failures in stablecoin systems

### Solution Pattern
```solidity
contract OracleFailureHandler {
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        bool isValid;
    }
    
    uint256 public constant PRICE_VALIDITY_DURATION = 1 hours;
    uint256 public constant MAX_PRICE_DEVIATION = 10; // 10%
    
    PriceData public lastValidPrice;
    
    // @notice Validate and update price data
    function updatePrice(uint256 newPrice) external {
        require(
            _isPriceValid(newPrice),
            "Price deviation too high"
        );
        
        lastValidPrice = PriceData({
            price: newPrice,
            timestamp: block.timestamp,
            isValid: true
        });
    }
    
    // @notice Check if price is valid
    function _isPriceValid(uint256 newPrice) internal view returns (bool) {
        if (!lastValidPrice.isValid) return true;
        
        if (block.timestamp > lastValidPrice.timestamp + PRICE_VALIDITY_DURATION) {
            return false;
        }
        
        uint256 deviation = _calculateDeviation(newPrice, lastValidPrice.price);
        return deviation <= MAX_PRICE_DEVIATION;
    }
    
    // @notice Calculate price deviation percentage
    function _calculateDeviation(uint256 p1, uint256 p2) internal pure returns (uint256) {
        if (p1 > p2) {
            return ((p1 - p2) * 100) / p2;
        }
        return ((p2 - p1) * 100) / p1;
    }
}
```

### Key Learning Points
1. Implement price validity checks
2. Add deviation thresholds
3. Include timestamp validation
4. Consider multiple oracle sources

## Access Control Comparison Study

**Learning Focus:** Understanding when to use different access control patterns

### Solution Pattern: Hybrid Access Control
```solidity
contract HybridAccessControl is AccessControl {
    struct RoleRequest {
        uint256 expiryTime;
        uint256 confirmations;
        mapping(address => bool) hasConfirmed;
    }
    
    mapping(bytes32 => RoleRequest) public roleRequests;
    
    // @notice Request temporary emergency role
    function requestEmergencyRole() external {
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp
        ));
        
        roleRequests[requestId].expiryTime = block.timestamp + 1 days;
    }
    
    // @notice Confirm emergency role request
    function confirmEmergencyRole(bytes32 requestId) external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        RoleRequest storage request = roleRequests[requestId];
        require(!request.hasConfirmed[msg.sender], "Already confirmed");
        
        request.hasConfirmed[msg.sender] = true;
        request.confirmations++;
        
        if (request.confirmations >= 3) {
            // Grant temporary role
            grantRole(EMERGENCY_ROLE, msg.sender);
        }
    }
}
```

### Key Learning Points
1. Understand role hierarchies
2. Implement time-bound roles
3. Use multi-signature confirmations
4. Consider gas efficiency

## Best Practices Summary

### System Design
1. **Modularity**
   - Separate concerns
   - Enable granular control
   - Allow for upgrades

2. **Safety Mechanisms**
   - Multiple validation layers
   - Gradual restrictions
   - Recovery procedures

3. **Monitoring**
   - Event emissions
   - State tracking
   - Activity logs

### Implementation Tips
```solidity
// Example of comprehensive safety checks
contract SafetyFirst {
    // @notice Implement multiple safety layers
    modifier withSafetyChecks(uint256 amount) {
        require(amount > 0, "Invalid amount");
        require(!paused(), "System is paused");
        require(
            lastOperationTime[msg.sender] + cooldownPeriod <= block.timestamp,
            "Cooldown period not elapsed"
        );
        _;
        emit OperationPerformed(msg.sender, amount);
    }
}
```

## References and Further Reading

1. **Technical Resources**
   - Ethereum Improvement Proposals (EIPs)
   - OpenZeppelin Documentation
   - Consensys Best Practices

2. **Case Studies**
   - DAI Emergency Shutdown
   - USDC Blacklisting Features
   - UST Collapse Analysis

3. **Development Tools**
   - Hardhat Testing Framework
   - Slither Static Analyzer
   - Echidna Fuzzing Tool
