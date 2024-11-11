# Writing Formal Specifications for DeFi Protocols

## Table of Contents
1. [Introduction](#introduction)
2. [Core Invariants](#core-invariants)
3. [State Transitions](#state-transitions)
4. [Economic Properties](#economic-properties)
5. [Implementation Guide](#implementation)
6. [References](#references)

## Introduction <a name="introduction"></a>
A comprehensive guide to writing formal specifications for DeFi protocols, focusing on security, economic invariants, and system properties.

## Core Invariants <a name="core-invariants"></a>

### Basic Protocol Structure
```solidity
contract LendingProtocol {
    mapping(address => mapping(address => uint256)) public deposits; // user => token => amount
    mapping(address => mapping(address => uint256)) public borrows;  // user => token => amount
    mapping(address => uint256) public prices;  // token => price
}
```

### Solvency Specification
```solidity
// Core solvency invariant
rule solvencyInvariant() {
    env e;
    
    mathint totalBorrowsValue = 0;
    mathint totalDepositsValue = 0;
    
    // Sum all positions
    for (address user; user.isContract) {
        for (address token; token.isContract) {
            totalBorrowsValue += borrows[user][token] * prices[token];
            totalDepositsValue += deposits[user][token] * prices[token];
        }
    }
    
    // Core invariant: borrows must be backed by deposits
    assert totalBorrowsValue <= totalDepositsValue * COLLATERAL_FACTOR / PRECISION;
}
```

## State Transitions <a name="state-transitions"></a>

### Deposit Flow
```solidity
rule depositStateTransition(address token, uint256 amount) {
    env e;
    
    // Store initial state
    mathint oldDeposits = totalDeposits(token);
    mathint oldUserBalance = deposits[e.msg.sender][token];
    
    // Perform deposit
    deposit(e, token, amount);
    
    // Verify state transition
    mathint newDeposits = totalDeposits(token);
    mathint newUserBalance = deposits[e.msg.sender][token];
    
    assert newDeposits == oldDeposits + amount;
    assert newUserBalance == oldUserBalance + amount;
}
```

### Withdrawal Rules
```solidity
rule withdrawalSafety(address token, uint256 amount) {
    env e;
    
    // Pre-conditions
    require amount <= deposits[e.msg.sender][token];
    
    // Store state before withdrawal
    mathint oldLiquidity = getAvailableLiquidity(token);
    
    // Attempt withdrawal
    withdraw(e, token, amount);
    
    // Post-conditions
    mathint newLiquidity = getAvailableLiquidity(token);
    assert newLiquidity >= 0, "Insufficient liquidity";
}
```

## Economic Properties <a name="economic-properties"></a>

### Interest Rate Model
```solidity
rule interestRateModel() {
    env e;
    
    // Verify interest rate increases with utilization
    mathint utilization1 = getUtilization();
    mathint rate1 = getInterestRate();
    
    // Simulate increased utilization
    simulateNewBorrow(e, 1000);
    mathint utilization2 = getUtilization();
    mathint rate2 = getInterestRate();
    
    assert utilization2 > utilization1 => rate2 >= rate1;
}
```

### Price Impact
```solidity
rule priceImpact(uint256 amount) {
    env e;
    
    // Store initial price
    mathint priceStart = getPrice();
    
    // Execute trade
    trade(e, amount);
    
    // Get final price
    mathint priceEnd = getPrice();
    
    // Verify price impact bounds
    mathint impact = abs(priceEnd - priceStart);
    assert impact <= MAX_PRICE_IMPACT;
}
```

## Implementation Guide <a name="implementation"></a>

### Step 1: Basic Safety Properties
```solidity
// Always verify basic safety first
contract SafeLendingProtocol {
    rule basicSafety() {
        // No overflow in arithmetic operations
        assert totalSupply <= type(uint256).max;
        
        // No underflow in withdrawals
        assert forall address a. balances[a] <= totalSupply;
        
        // Proper access control
        assert onlyAdmin => msg.sender == admin;
    }
}
```

### Step 2: Economic Invariants
```solidity
// Then add economic properties
rule economicSafety() {
    // Collateralization ratio maintained
    assert forall address a. 
        borrowValue(a) <= collateralValue(a) * collateralFactor;
    
    // Interest rates remain within bounds
    assert minRate <= currentRate <= maxRate;
}
```

### Step 3: Complex Interactions
```solidity
// Finally verify complex interactions
rule complexInteractions() {
    // Flash loan safety
    flashLoan();
    assert totalReserves >= initialReserves;
    
    // Liquidation correctness
    liquidate(account);
    assert healthFactor(account) >= minHealthFactor;
}
```

## References <a name="references"></a>

1. [Aave Protocol Documentation](https://docs.aave.com/)
2. [Compound Finance Whitepaper](https://compound.finance/documents/Compound.Whitepaper.pdf)
3. Formal Verification Papers:
   - "Making Smart Contracts Smarter"
   - "Formal Verification of DeFi Lending Protocols"

## Comments

Writing formal specifications for DeFi protocols requires careful consideration of both technical correctness and economic soundness. The specifications should cover all aspects of the protocol's operation while remaining verifiable.

---
*Note: This document is part of a series on Smart Contract Formal Verification.*
