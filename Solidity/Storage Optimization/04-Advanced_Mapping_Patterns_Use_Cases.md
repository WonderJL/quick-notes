
# Solidity Advanced Mapping Patterns: Use Cases

This guide explores practical use cases for advanced mapping patterns in Solidity, including circular buffers and priority queues.

## Circular Buffer Use Cases

### A. Event History Tracking

Circular buffers are useful for tracking recent events, like user actions or interactions, within a fixed-size limit.

#### Example

```solidity
contract EventHistory {
    struct Event {
        address user;
        uint256 timestamp;
        bytes32 action;
    }
    
    struct CircularEventLog {
        mapping(uint256 => Event) events;
        uint256 first;
        uint256 length;
        uint256 maxSize;
    }
    
    CircularEventLog private eventLog;
    
    constructor(uint256 _maxEvents) {
        eventLog.maxSize = _maxEvents;
    }
    
    // Store last N user actions
    function logUserAction(address user, bytes32 action) external {
        uint256 index = (eventLog.first + eventLog.length) % eventLog.maxSize;
        eventLog.events[index] = Event(user, block.timestamp, action);
        
        if (eventLog.length < eventLog.maxSize) {
            eventLog.length++;
        } else {
            eventLog.first = (eventLog.first + 1) % eventLog.maxSize;
        }
    }
    
    // Get recent activity for analysis
    function getRecentEvents(uint256 count) external view 
        returns (Event[] memory) {
        uint256 resultCount = count > eventLog.length ? eventLog.length : count;
        Event[] memory result = new Event[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = eventLog.events[(eventLog.first + i) % eventLog.maxSize];
        }
        return result;
    }
}
```

### B. Rate Limiting Implementation

Circular buffers also work well for rate limiting by tracking recent requests within a set time window.

#### Example

```solidity
contract RateLimiter {
    struct TimeWindow {
        mapping(uint256 => uint256) timestamps;
        uint256 first;
        uint256 count;
        uint256 windowSize;
    }
    
    mapping(address => TimeWindow) private userWindows;
    uint256 private constant MAX_REQUESTS = 10;
    uint256 private constant WINDOW_DURATION = 3600; // 1 hour
    
    function checkAndUpdateRateLimit(address user) external returns (bool) {
        TimeWindow storage window = userWindows[user];
        if (window.windowSize == 0) {
            window.windowSize = MAX_REQUESTS;
        }
        
        uint256 currentTime = block.timestamp;
        // Remove expired timestamps
        while (window.count > 0 && 
               currentTime - window.timestamps[window.first] > WINDOW_DURATION) {
            window.first = (window.first + 1) % window.windowSize;
            window.count--;
        }
        
        if (window.count >= MAX_REQUESTS) {
            return false;
        }
        
        uint256 index = (window.first + window.count) % window.windowSize;
        window.timestamps[index] = currentTime;
        window.count++;
        return true;
    }
}
```

---

## Priority Queue Use Cases

### A. Transaction Priority System

Priority queues can manage transactions by prioritizing them based on fees or other criteria.

#### Example

```solidity
contract PriorityTransactionSystem {
    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
    }
    
    struct PQueue {
        mapping(uint256 => Transaction) txs;
        uint256 size;
    }
    
    PQueue private transactionQueue;
    
    // Submit transaction with priority based on fee
    function submitTransaction(address recipient, uint256 amount, uint256 fee) 
        external {
        Transaction memory newTx = Transaction({
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            fee: fee,
            timestamp: block.timestamp
        });
        
        uint256 position = transactionQueue.size;
        transactionQueue.txs[position] = newTx;
        
        // Bubble up based on fee
        while (position > 0) {
            uint256 parent = (position - 1) / 2;
            if (transactionQueue.txs[parent].fee >= fee) break;
            
            // Swap with parent
            Transaction memory temp = transactionQueue.txs[parent];
            transactionQueue.txs[parent] = transactionQueue.txs[position];
            transactionQueue.txs[position] = temp;
            position = parent;
        }
        
        transactionQueue.size++;
    }
    
    // Process highest priority transaction
    function processNextTransaction() external {
        require(transactionQueue.size > 0, "No transactions");
        
        Transaction memory highestPriority = transactionQueue.txs[0];
        // Process the transaction...
        
        // Remove from queue and rebalance
        transactionQueue.size--;
        transactionQueue.txs[0] = transactionQueue.txs[transactionQueue.size];
    }
}
```

### B. Liquidation Queue for DeFi

Priority queues can manage DeFi liquidation orders by prioritizing users with the highest risk.

#### Example

```solidity
contract LiquidationQueue {
    struct Position {
        address user;
        uint256 collateralRatio;
        uint256 debt;
    }
    
    struct RiskQueue {
        mapping(uint256 => Position) positions;
        uint256 size;
    }
    
    RiskQueue private liquidationQueue;
    
    // Update position risk score
    function updatePositionRisk(address user, uint256 newRatio) external {
        // Find and update position
        for (uint256 i = 0; i < liquidationQueue.size; i++) {
            if (liquidationQueue.positions[i].user == user) {
                liquidationQueue.positions[i].collateralRatio = newRatio;
                _rebalancePosition(i);
                break;
            }
        }
    }
    
    // Rebalance position in queue based on risk
    function _rebalancePosition(uint256 pos) private {
        uint256 currentRatio = liquidationQueue.positions[pos].collateralRatio;
        
        // Bubble down to maintain highest risk at top
        while (true) {
            uint256 smallest = pos;
            uint256 left = 2 * pos + 1;
            uint256 right = 2 * pos + 2;
            
            if (left < liquidationQueue.size && 
                liquidationQueue.positions[left].collateralRatio < 
                liquidationQueue.positions[smallest].collateralRatio) {
                smallest = left;
            }
            
            if (right < liquidationQueue.size && 
                liquidationQueue.positions[right].collateralRatio < 
                liquidationQueue.positions[smallest].collateralRatio) {
                smallest = right;
            }
            
            if (smallest == pos) break;
            
            Position memory temp = liquidationQueue.positions[pos];
            liquidationQueue.positions[pos] = liquidationQueue.positions[smallest];
            liquidationQueue.positions[smallest] = temp;
            pos = smallest;
        }
    }
}
```

---

## Technical Considerations

- **Circular Buffers**: Provide efficient fixed-size tracking and history logging for user actions or rate limiting.
- **Priority Queues**: Prioritize elements based on specific criteria but may require gas-intensive rebalancing for large datasets.

---

## References

1. [Advanced Solidity Data Structures](https://docs.soliditylang.org/en/latest/types.html)
2. [Ethereum Data Structure Optimization](https://ethereum.org/en/developers/docs/)

---

These examples showcase how Solidity developers can implement efficient tracking, prioritization, and rate-limiting mechanisms using advanced mapping patterns.
