# Solidity Security Patterns: Emergency Patterns
*Last Updated: November 10, 2024*

## Table of Contents
- [Overview](#overview)
- [Implementation Patterns](#implementation-patterns)
  - [Circuit Breaker Pattern](#circuit-breaker-pattern)
  - [Rate Limiting](#rate-limiting)
  - [Kill Switch](#kill-switch)
  - [Emergency Contact](#emergency-contact)
- [OpenZeppelin Implementation](#openzeppelin-implementation)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [Interview Questions](#interview-questions)
- [References](#references)

## Overview

Emergency patterns are crucial security mechanisms in smart contracts that enable controlled responses to unexpected situations or security incidents. These patterns help protect user funds and contract functionality during critical situations.

## Implementation Patterns

### Circuit Breaker Pattern

The circuit breaker pattern allows for pausing contract functionality in emergency situations. It's implemented using OpenZeppelin's Pausable contract.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CircuitBreaker is Pausable, Ownable {
    // Events for tracking state changes
    event EmergencyTriggered(address indexed triggeredBy, uint256 timestamp);
    event EmergencyResolved(address indexed resolvedBy, uint256 timestamp);

    // State variable tracking emergency status
    bool public isEmergency;

    constructor() Ownable(msg.sender) {}

    // Function to trigger emergency stop
    function triggerEmergency() external onlyOwner {
        isEmergency = true;
        _pause();
        emit EmergencyTriggered(msg.sender, block.timestamp);
    }

    // Function to resolve emergency
    function resolveEmergency() external onlyOwner {
        isEmergency = false;
        _unpause();
        emit EmergencyResolved(msg.sender, block.timestamp);
    }

    // Protected function example
    function sensitiveOperation() external whenNotPaused {
        // Sensitive operation logic
    }
}
```

### Rate Limiting

Rate limiting prevents rapid successive operations that could drain contract resources.

```solidity
contract RateLimiter {
    uint256 public constant RATE_LIMIT = 1 ether;
    uint256 public constant RATE_LIMIT_PERIOD = 1 days;
    
    mapping(address => uint256) public lastOperationTime;
    mapping(address => uint256) public operationAmount;

    modifier withinRateLimit(uint256 amount) {
        require(
            block.timestamp >= lastOperationTime[msg.sender] + RATE_LIMIT_PERIOD ||
            operationAmount[msg.sender] + amount <= RATE_LIMIT,
            "Rate limit exceeded"
        );
        _;
    }

    function protectedOperation(uint256 amount) external withinRateLimit(amount) {
        lastOperationTime[msg.sender] = block.timestamp;
        operationAmount[msg.sender] = amount;
        // Operation logic
    }
}
```

### Kill Switch

The kill switch pattern provides a mechanism for permanent contract deactivation.

```solidity
contract KillSwitch is Ownable {
    bool private _killed;
    
    event ContractKilled(address indexed killer, uint256 timestamp);

    modifier notKilled() {
        require(!_killed, "Contract has been killed");
        _;
    }

    function killContract() external onlyOwner {
        _killed = true;
        // Transfer remaining funds to owner
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
        emit ContractKilled(msg.sender, block.timestamp);
    }

    // All operational functions should use notKilled modifier
    function operation() external notKilled {
        // Operation logic
    }
}
```

### Emergency Contact

Implementation of a separate emergency contact role for additional security.

```solidity
contract EmergencyContact is Ownable {
    address public emergencyContact;
    
    event EmergencyContactUpdated(
        address indexed oldContact,
        address indexed newContact
    );

    modifier onlyEmergencyContact() {
        require(msg.sender == emergencyContact, "Not emergency contact");
        _;
    }

    function updateEmergencyContact(address newContact) external onlyOwner {
        require(newContact != address(0), "Invalid address");
        address oldContact = emergencyContact;
        emergencyContact = newContact;
        emit EmergencyContactUpdated(oldContact, newContact);
    }

    function emergencyOperation() external onlyEmergencyContact {
        // Emergency operation logic
    }
}
```

## OpenZeppelin Implementation

The Pausable contract from OpenZeppelin provides a robust implementation of the circuit breaker pattern:

```solidity
abstract contract Pausable {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused(), "Pausable: not paused");
        _;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}
```

## Best Practices

1. **Event Emission**
   - Always emit events for state changes
   - Include relevant information in event parameters
   - Use indexed parameters for important fields

2. **Access Control**
   - Implement multiple levels of access control
   - Separate owner and emergency contact roles
   - Use OpenZeppelin's Access Control contracts

3. **Rate Limiting**
   - Implement for sensitive operations
   - Use appropriate time windows
   - Consider gas costs in limits

4. **Testing**
   - Test all emergency scenarios
   - Verify state transitions
   - Check access control restrictions

## Common Pitfalls

1. **Insufficient Testing**
   - Not testing emergency functions
   - Missing edge cases
   - Incomplete state transition tests

2. **Access Control Issues**
   - Missing access controls
   - Incorrect modifier usage
   - Inadequate role separation

3. **Event Emission**
   - Missing important events
   - Insufficient event parameters
   - No indexed fields

4. **State Management**
   - Incorrect state transitions
   - Missing state checks
   - Inadequate state validation

## Interview Questions

1. **Circuit Breaker Implementation**
   Q: How would you implement a circuit breaker pattern in a smart contract?
   
   A: Use OpenZeppelin's Pausable contract with custom emergency states:
   ```solidity
   function triggerEmergency() external onlyOwner {
       isEmergency = true;
       _pause();
       emit EmergencyTriggered(msg.sender, block.timestamp);
   }
   ```

2. **Rate Limiting**
   Q: How would you prevent rapid successive withdrawals?
   
   A: Implement time-based checks and amount tracking:
   ```solidity
   require(
       block.timestamp >= lastWithdrawalTime[msg.sender] + RATE_LIMIT_PERIOD,
       "Too frequent"
   );
   ```

3. **Kill Switch vs Circuit Breaker**
   Q: What's the difference between a kill switch and circuit breaker?
   
   A: Circuit breaker temporarily pauses functionality with the ability to resume, while a kill switch permanently disables the contract.

## References

1. OpenZeppelin Documentation
   - [Pausable](https://docs.openzeppelin.com/contracts/4.x/api/security#Pausable)
   - [Access Control](https://docs.openzeppelin.com/contracts/4.x/access-control)

2. Ethereum Security Patterns
   - [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
   - [Smart Contract Weakness Classification](https://swcregistry.io/)

3. EIPs
   - [EIP-1967: Standard Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)
   - [EIP-2535: Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535)

---
*Note: This documentation is for educational purposes. Always conduct thorough testing and auditing before deploying smart contracts to production.*
