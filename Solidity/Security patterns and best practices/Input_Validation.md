# Input Validation and Sanitization in Solidity Smart Contracts

## Table of Contents
- [Introduction](#introduction)
- [Types of Input Validation](#types-of-input-validation)
- [Validation Patterns](#validation-patterns)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Testing Strategies](#testing-strategies)
- [Common Vulnerabilities](#common-vulnerabilities)
- [References](#references)

## Introduction

Input validation and sanitization are crucial for smart contract security. Invalid inputs can lead to unexpected behavior, security vulnerabilities, or contract failure. This document covers comprehensive validation strategies and implementations.

## Types of Input Validation

### 1. Basic Parameter Validation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BasicValidation {
    // Constants for validation
    uint256 public constant MIN_AMOUNT = 0.01 ether;
    uint256 public constant MAX_AMOUNT = 100 ether;
    
    // Events
    event ParameterValidationFailed(
        string reason,
        address sender,
        uint256 value
    );

    // Modifiers for common validations
    modifier validateAddress(address _addr) {
        require(_addr != address(0), "Zero address");
        require(_addr.code.length == 0, "Must be EOA");
        _;
    }

    modifier validateAmount(uint256 _amount) {
        require(_amount >= MIN_AMOUNT, "Amount too small");
        require(_amount <= MAX_AMOUNT, "Amount too large");
        _;
    }

    // Example function with parameter validation
    function transfer(
        address _to,
        uint256 _amount
    ) 
        external 
        validateAddress(_to)
        validateAmount(_amount) 
    {
        // Transfer logic
    }
}
```

### 2. Array Validation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ArrayValidation {
    uint256 public constant MAX_ARRAY_LENGTH = 100;
    
    // Custom errors for gas efficiency
    error ArrayTooLong(uint256 length);
    error InvalidArrayValue(uint256 index, uint256 value);

    function processArray(uint256[] calldata data) external pure returns (uint256) {
        // Check array length
        if(data.length > MAX_ARRAY_LENGTH) {
            revert ArrayTooLong(data.length);
        }
        require(data.length > 0, "Empty array");

        uint256 sum = 0;
        for(uint256 i = 0; i < data.length; i++) {
            // Validate each element
            if(data[i] == 0) {
                revert InvalidArrayValue(i, data[i]);
            }
            sum += data[i];
        }
        
        return sum;
    }

    // Validate multiple arrays
    function validateArrayPair(
        address[] calldata addresses,
        uint256[] calldata values
    ) external pure {
        require(
            addresses.length == values.length,
            "Length mismatch"
        );
        require(
            addresses.length <= MAX_ARRAY_LENGTH,
            "Array too long"
        );

        for(uint256 i = 0; i < addresses.length; i++) {
            require(addresses[i] != address(0), "Invalid address");
            require(values[i] > 0, "Invalid value");
        }
    }
}
```

### 3. Complex Struct Validation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StructValidation {
    struct UserOperation {
        address user;
        uint256 amount;
        uint256 deadline;
        bytes data;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    // Events
    event ValidationFailed(string reason, UserOperation operation);
    event OperationProcessed(address indexed user, uint256 amount);

    function validateOperation(
        UserOperation calldata op
    ) public pure returns (bool valid, string memory error) {
        // Address validation
        if(op.user == address(0)) {
            return (false, "Invalid user address");
        }

        // Amount validation
        if(op.amount == 0) {
            return (false, "Zero amount");
        }

        // Deadline validation
        if(op.deadline < block.timestamp) {
            return (false, "Operation expired");
        }

        // Data validation
        if(op.data.length > 0) {
            if(op.data.length < 4) {
                return (false, "Invalid data length");
            }
        }

        // Signature validation
        if(op.v != 27 && op.v != 28) {
            return (false, "Invalid signature v value");
        }

        return (true, "");
    }
}
```

### 4. String Validation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StringValidation {
    // Events
    event StringValidated(string value);
    event ValidationFailed(string reason);

    // String length limits
    uint256 public constant MIN_LENGTH = 1;
    uint256 public constant MAX_LENGTH = 100;

    function validateString(
        string calldata input
    ) public pure returns (bool) {
        bytes memory stringBytes = bytes(input);
        
        // Length validation
        if(stringBytes.length < MIN_LENGTH || 
           stringBytes.length > MAX_LENGTH) {
            return false;
        }

        // Character validation
        for(uint i = 0; i < stringBytes.length; i++) {
            bytes1 char = stringBytes[i];
            
            // Allow only alphanumeric and basic punctuation
            if(!(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x41 && char <= 0x5A) || // A-Z
                (char >= 0x61 && char <= 0x7A) || // a-z
                char == 0x20 || // space
                char == 0x2E || // .
                char == 0x2C    // ,
            )) {
                return false;
            }
        }

        return true;
    }
}
```

## Best Practices

### 1. Use Custom Errors for Gas Efficiency

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ValidationBestPractices {
    // Custom errors
    error InvalidAmount(uint256 amount, uint256 min, uint256 max);
    error InvalidAddress(address addr);
    error InvalidArrayLength(uint256 length, uint256 maxLength);

    // Constants
    uint256 constant MIN_AMOUNT = 0.01 ether;
    uint256 constant MAX_AMOUNT = 100 ether;
    uint256 constant MAX_ARRAY_LENGTH = 100;

    function processWithCustomErrors(
        uint256 amount,
        address recipient,
        uint256[] calldata data
    ) external pure {
        // Amount validation
        if(amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
            revert InvalidAmount(amount, MIN_AMOUNT, MAX_AMOUNT);
        }

        // Address validation
        if(recipient == address(0)) {
            revert InvalidAddress(recipient);
        }

        // Array validation
        if(data.length > MAX_ARRAY_LENGTH) {
            revert InvalidArrayLength(data.length, MAX_ARRAY_LENGTH);
        }
    }
}
```

### 2. Comprehensive Input Validation Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ComprehensiveValidation {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        uint256 deadline;
    }

    // Events
    event TransactionValidated(bytes32 indexed txHash);
    event ValidationFailed(bytes32 indexed txHash, string reason);

    function validateTransaction(
        Transaction calldata tx
    ) public view returns (bool valid, string memory error) {
        // Address validation
        if(tx.to == address(0)) {
            return (false, "Invalid recipient");
        }

        // Value validation
        if(tx.value == 0) {
            return (false, "Zero value");
        }

        // Data validation
        if(tx.data.length > 0 && tx.data.length < 4) {
            return (false, "Invalid data length");
        }

        // Deadline validation
        if(tx.deadline < block.timestamp) {
            return (false, "Transaction expired");
        }

        return (true, "");
    }
}
```

## Testing Strategies

### 1. Unit Tests

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Input Validation", function () {
    let validation;
    let owner;
    let addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        
        const Validation = await ethers.getContractFactory(
            "ComprehensiveValidation"
        );
        validation = await Validation.deploy();
        await validation.deployed();
    });

    describe("Transaction Validation", function () {
        it("Should validate valid transaction", async function () {
            const tx = {
                to: addr1.address,
                value: ethers.utils.parseEther("1"),
                data: "0x",
                deadline: Math.floor(Date.now() / 1000) + 3600
            };

            const [valid, error] = await validation.validateTransaction(tx);
            expect(valid).to.be.true;
            expect(error).to.equal("");
        });

        it("Should reject invalid address", async function () {
            const tx = {
                to: ethers.constants.AddressZero,
                value: ethers.utils.parseEther("1"),
                data: "0x",
                deadline: Math.floor(Date.now() / 1000) + 3600
            };

            const [valid, error] = await validation.validateTransaction(tx);
            expect(valid).to.be.false;
            expect(error).to.equal("Invalid recipient");
        });
    });
});
```

## Common Vulnerabilities

### 1. Integer Overflow/Underflow

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IntegerValidation {
    // Note: Solidity 0.8.x has built-in overflow checks
    
    function validateInteger(
        uint256 value
    ) external pure returns (bool) {
        // Check for reasonable bounds
        require(value > 0, "Zero value");
        require(
            value <= type(uint128).max,
            "Value too large"
        );

        // Additional business logic checks
        require(
            value % 2 == 0,
            "Must be even number"
        );

        return true;
    }

    // Safe arithmetic operations
    function safeAdd(
        uint256 a,
        uint256 b
    ) external pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "Overflow");
        return c;
    }
}
```

## References

1. Solidity Documentation
   - [Security Considerations](https://docs.soliditylang.org/en/v0.8.19/security-considerations.html)
   - [Common Patterns](https://docs.soliditylang.org/en/v0.8.19/common-patterns.html)

2. Smart Contract Security
   - [ConsenSys Best Practices](https://consensys.github.io/smart-contract-best-practices/)
   - [SWC Registry](https://swcregistry.io/)

3. Tools and Analysis
   - [Mythril](https://github.com/ConsenSys/mythril)
   - [Slither](https://github.com/crytic/slither)

4. Additional Resources
   - [OpenZeppelin Security Blog](https://blog.openzeppelin.com/security-audits/)
   - [Ethereum Smart Contract Security Guidelines](https://github.com/ethereum/wiki/wiki/Safety)
