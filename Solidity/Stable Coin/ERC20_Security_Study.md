# ERC20 Token Security: Approvals and Collateralization
*Study Notes for Blockchain Engineers*

## Table of Contents
1. [ERC20 Standard Overview](#erc20-standard-overview)
2. [Approval Mechanism Deep Dive](#approval-mechanism-deep-dive)
3. [Collateralization Mechanisms](#collateralization-mechanisms)
4. [Security Best Practices](#security-best-practices)
5. [Interview Questions & Answers](#interview-questions--answers)

## ERC20 Standard Overview

### Key Points
- ERC20 = EIP-20 (Ethereum Improvement Proposal 20)
- Authors: Vitalik Buterin and Fabian Vogelsteller (2015)
- Defines standard interface for fungible tokens

### Core Functions
```solidity
function totalSupply() public view returns (uint256)
function balanceOf(address account) public view returns (uint256)
function transfer(address recipient, uint256 amount) public returns (bool)
function allowance(address owner, address spender) public view returns (uint256)
function approve(address spender, uint256 amount) public returns (bool)
function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)
```

## Approval Mechanism Deep Dive

### The Approval Race Condition

#### What It Is
The approval race condition occurs when changing an existing non-zero allowance to another non-zero value.

#### Important Notes
- Only affects existing non-zero allowances
- Only the approved spender can exploit this
- Random attackers cannot perform this exploit
- More of a "design limitation" than an "attack"

#### Example Scenario
```solidity
// Initial state
token.approve(spender, 100);    // First approval
token.approve(spender, 50);     // Attempting to reduce allowance

// Potential Race Condition:
// 1. Spender uses original 100
// 2. New approval of 50 goes through
// 3. Spender can use additional 50
// Result: 150 tokens used instead of intended 50
```

### Safe Patterns

#### 1. Two-Step Approve
```solidity
// Safe way to change allowance
token.approve(spender, 0);         // First reset to zero
token.approve(spender, newAmount); // Then set new amount
```

#### 2. Increase/Decrease Pattern
```solidity
// Safer alternatives to approve
token.increaseAllowance(spender, addedValue);
token.decreaseAllowance(spender, subtractedValue);
```

## Collateralization Mechanisms

### Types
1. Over-collateralization (>100%)
2. Full-collateralization (1:1)
3. Fractional collateralization

### Key Components
- Liquidation mechanisms
- Price oracle integration
- Collateral ratio monitoring
- Emergency shutdown procedures

## Security Best Practices

### 1. Use SafeERC20
```solidity
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
```

### 2. Implement Security Features
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
```

### 3. Use Custom Errors
```solidity
error InsufficientBalance(uint256 requested, uint256 available);
error TransferFailed();
```

## Interview Questions & Answers

### Q1: Explain the approval race condition in ERC20 tokens
**Answer**: The race condition occurs when changing an existing non-zero allowance. Only the approved spender can exploit this by:
1. Using the original allowance
2. Waiting for new approval
3. Using additional allowance

### Q2: How would you safely implement allowance changes?
**Answer**: Use either:
1. Two-step approve (reset to 0 first)
2. increaseAllowance/decreaseAllowance functions
3. SafeERC20 library from OpenZeppelin

## References
1. EIP-20: Token Standard
2. OpenZeppelin Documentation
3. Ethereum Smart Contract Best Practices

---
*Note: This document is for educational purposes. Always audit and test code before production use.*
