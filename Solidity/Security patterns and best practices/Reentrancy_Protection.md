# Reentrancy Protection in Solidity Smart Contracts

## Table of Contents
- [Introduction](#introduction)
- [Understanding Reentrancy](#understanding-reentrancy)
- [Protection Patterns](#protection-patterns)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Testing For Reentrancy](#testing-for-reentrancy)
- [Common Pitfalls](#common-pitfalls)
- [References](#references)

## Introduction

Reentrancy is one of the most critical vulnerabilities in smart contracts. The infamous DAO hack in 2016 used a reentrancy attack to drain millions of ETH. This document covers comprehensive reentrancy protection strategies and implementations.

### What is Reentrancy?

Reentrancy occurs when a function can be interrupted during execution and called again before the first execution is completed.

```solidity
// Vulnerable Example
contract VulnerableContract {
    mapping(address => uint256) public balances;

    // Vulnerable function
    function withdraw() public {
        uint256 balance = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: balance}("");
        // State update after external call - vulnerable!
        balances[msg.sender] = 0;
    }
}
```

## Protection Patterns

### 1. Checks-Effects-Interactions (CEI) Pattern

The most fundamental protection against reentrancy.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CEIPattern {
    mapping(address => uint256) private balances;

    event Withdrawal(address indexed user, uint256 amount);
    event Deposit(address indexed user, uint256 amount);

    function withdraw() external {
        // 1. Checks
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");

        // 2. Effects
        balances[msg.sender] = 0;

        // 3. Interactions
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, balance);
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
```

### 2. ReentrancyGuard (OpenZeppelin Implementation)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SecureContract is ReentrancyGuard {
    mapping(address => uint256) private balances;

    // Using OpenZeppelin's nonReentrant modifier
    function withdraw() external nonReentrant {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");

        balances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
```

### 3. Custom Mutex Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CustomReentrancyGuard {
    bool private locked;

    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    mapping(address => uint256) private balances;

    function withdraw() external noReentrant {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");

        balances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
```

## Best Practices

### 1. State Management

```solidity
contract StateBestPractices {
    // 1. Update state before external calls
    mapping(address => uint256) private balances;

    function goodWithdraw() external {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;  // State update before call
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // 2. Use reentrancy guard for all external calls
    function complexOperation() external nonReentrant {
        // Complex logic with multiple external calls
    }

    // 3. Be careful with multiple external calls
    function multipleExternalCalls() external nonReentrant {
        // First call
        (bool success1, ) = address1.call{value: amount1}("");
        require(success1, "Call 1 failed");

        // Second call
        (bool success2, ) = address2.call{value: amount2}("");
        require(success2, "Call 2 failed");
    }
}
```

### 2. Cross-Function Reentrancy Protection

```solidity
contract CrossFunctionReentrancy is ReentrancyGuard {
    mapping(address => uint256) private balances;
    mapping(address => bool) private locked;

    modifier userNonReentrant() {
        require(!locked[msg.sender], "User locked");
        locked[msg.sender] = true;
        _;
        locked[msg.sender] = false;
    }

    function withdraw() external nonReentrant userNonReentrant {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");

        balances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
```

## Testing For Reentrancy

### 1. Attack Contract Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ReentrancyAttacker {
    VulnerableContract public vulnerable;
    uint256 public attackCount;

    constructor(address _vulnerable) {
        vulnerable = VulnerableContract(_vulnerable);
    }

    // Fallback function to execute the attack
    receive() external payable {
        if(attackCount < 5) {
            attackCount++;
            vulnerable.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value >= 1 ether, "Need ETH to attack");
        vulnerable.deposit{value: 1 ether}();
        vulnerable.withdraw();
    }
}
```

### 2. Test Suite

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Protection", function () {
    let secureContract;
    let attacker;
    let owner;
    let attackerContract;

    beforeEach(async function () {
        [owner, attacker] = await ethers.getSigners();
        
        const SecureContract = await ethers.getContractFactory("SecureContract");
        secureContract = await SecureContract.deploy();
        
        const Attacker = await ethers.getContractFactory("ReentrancyAttacker");
        attackerContract = await Attacker.connect(attacker).deploy(
            secureContract.address
        );
    });

    it("Should prevent reentrancy attacks", async function () {
        // Initial deposit
        await secureContract.deposit({ value: ethers.utils.parseEther("1") });

        // Attempt attack
        await expect(
            attackerContract.connect(attacker).attack({
                value: ethers.utils.parseEther("1")
            })
        ).to.be.reverted;
    });
});
```

## Common Pitfalls

### 1. Incorrect State Management

```solidity
// BAD: State update after external call
function badWithdraw() external {
    uint256 balance = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: balance}("");
    balances[msg.sender] = 0;  // TOO LATE!
}

// GOOD: State update before external call
function goodWithdraw() external {
    uint256 balance = balances[msg.sender];
    balances[msg.sender] = 0;  // Update first
    (bool success, ) = msg.sender.call{value: balance}("");
}
```

### 2. Missing Reentrancy Protection in Related Functions

```solidity
contract PitfallExample {
    // Protected function
    function withdraw() external nonReentrant {
        // Protected from reentrancy
    }

    // DANGEROUS: Related function without protection
    function withdrawAll() external {
        // Could be used to bypass protection
    }
}
```

### 3. Nested Calls Vulnerability

```solidity
contract NestedCallsVulnerable {
    function nestedCalls() external {
        // First call
        externalContract1.call("");
        
        // Second call could be reentered from first call
        externalContract2.call("");
    }
}
```

## References

1. OpenZeppelin Documentation
   - [ReentrancyGuard](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard)
   - [Security Considerations](https://docs.openzeppelin.com/contracts/4.x/api/security)

2. Ethereum Smart Contract Security
   - [SWC Registry - Reentrancy](https://swcregistry.io/docs/SWC-107)
   - [Consensys Best Practices](https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/)

3. Academic Papers
   - ["Making Smart Contracts Smarter"](https://eprint.iacr.org/2016/633.pdf)
   - ["Enter the Hydra: Towards Principled Bug Bounties and Exploit-Resistant Smart Contracts"](https://eprint.iacr.org/2017/1090.pdf)

4. Tools and Analysis
   - [Slither](https://github.com/crytic/slither) - Static analyzer for Solidity
   - [Echidna](https://github.com/crytic/echidna) - Fuzzing tool for Ethereum smart contracts

5. Historical References
   - [The DAO Attack](https://blog.ethereum.org/2016/06/17/critical-update-re-dao-vulnerability/)
   - [Analysis of the DAO exploit](https://hackingdistributed.com/2016/06/18/analysis-of-the-dao-exploit/)
