# Formal Verification of Reentrancy Protection

## Table of Contents
1. [Introduction](#introduction)
2. [Reentrancy Patterns](#patterns)
3. [Verification Approaches](#verification)
4. [Implementation Examples](#examples)
5. [Best Practices](#practices)
6. [References](#references)

## Introduction <a name="introduction"></a>
Comprehensive guide to formally verifying reentrancy protection in smart contracts.

## Reentrancy Patterns <a name="patterns"></a>

### Basic Reentrancy Guard
```solidity
contract SecureVault {
    uint256 private locked = 1;
    mapping(address => uint256) private balances;
    
    modifier noReentrant() {
        require(locked == 1, "Reentrant call");
        locked = 2;
        _;
        locked = 1;
    }
    
    function withdraw(uint256 amount) public noReentrant {
        require(balances[msg.sender] >= amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] -= amount;
    }
}
```

### Formal Specification
```solidity
// Reentrancy Properties
rule noReentrancyAllowed(method f) {
    env e;
    
    // Track call depth
    require callDepth == 1;
    
    // First call
    invoke f(e);
    
    // Try reentrant call
    env e2;
    invoke f(e2);
    
    // Must revert
    assert lastReverted;
}
```

## Verification Approaches <a name="verification"></a>

### State Machine Verification
```solidity
// State transition verification
rule stateTransitionsAreAtomic() {
    env e;
    
    // Store initial state
    uint256 initialLocked = locked;
    uint256 initialBalance = balances[e.msg.sender];
    
    // Execute withdrawal
    withdraw(amount);
    
    // Verify outcomes
    assert !lastReverted => 
        locked == initialLocked &&
        balances[e.msg.sender] == initialBalance - amount;
        
    assert lastReverted =>
        locked == initialLocked &&
        balances[e.msg.sender] == initialBalance;
}
```

### Cross-Function Reentrancy
```solidity
rule crossFunctionReentrancy(method f1, method f2) {
    env e1;
    env e2;
    
    // Start first function
    invoke f1(e1);
    
    // Try second function
    invoke f2(e2);
    
    // Verify protection works across functions
    assert f1 != f2 => lastReverted;
}
```

## Implementation Examples <a name="examples"></a>

### Complete Verifiable Implementation
```solidity
contract VerifiableVault {
    uint256 private constant LOCKED = 1;
    uint256 private constant UNLOCKED = 2;
    uint256 private _status;
    
    mapping(address => uint256) private _balances;
    
    modifier nonReentrant() {
        require(_status == UNLOCKED, "ReentrancyGuard: reentrant call");
        _status = LOCKED;
        _;
        _status = UNLOCKED;
    }
    
    function deposit() public payable nonReentrant {
        _balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public nonReentrant {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

### Verification Properties
```solidity
// Comprehensive verification rules
rule comprehensiveReentrancyCheck() {
    env e;
    
    storage initialState = getStorage();
    
    // Execute any function
    if (f.selector == withdraw.selector) {
        withdraw(e, amount);
    }
    
    // Verify outcomes
    assert !lastReverted => 
        locked == 1 &&
        validStateTransition(initialState, getStorage());
        
    assert lastReverted && isReentrant => 
        getStorage() == initialState;