# Signature Validation in Solidity Smart Contracts

## Table of Contents
- [Introduction](#introduction)
- [Digital Signature Basics](#digital-signature-basics)
- [Implementation Patterns](#implementation-patterns)
- [Security Considerations](#security-considerations)
- [Testing Strategies](#testing-strategies)
- [Common Vulnerabilities](#common-vulnerabilities)
- [References](#references)

## Introduction

Digital signatures are crucial for blockchain applications, enabling off-chain message signing and secure transaction authorization. This document covers comprehensive signature validation implementations and best practices.

## Digital Signature Basics

### 1. Signature Components

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SignatureBasics {
    struct Signature {
        uint8 v;      // Recovery identifier
        bytes32 r;    // First 32 bytes of signature
        bytes32 s;    // Second 32 bytes of signature
    }

    struct SignedMessage {
        bytes message;     // Original message
        uint256 nonce;    // Prevent replay attacks
        uint256 deadline; // Expiration timestamp
    }

    // Events
    event MessageVerified(
        address indexed signer,
        bytes message,
        uint256 timestamp
    );
}
```

## Implementation Patterns

### 1. Basic Signature Validation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract BasicSignatureValidation {
    using ECDSA for bytes32;

    // Events
    event SignatureVerified(address indexed signer, bytes32 hash);
    
    // Storage for used signatures (prevent replay)
    mapping(bytes32 => bool) public usedSignatures;

    function verifySignature(
        bytes32 hash,
        bytes memory signature,
        address expectedSigner
    ) public pure returns (bool) {
        address recoveredSigner = hash.recover(signature);
        return recoveredSigner == expectedSigner;
    }

    function verifyMessage(
        bytes memory message,
        bytes memory signature,
        address expectedSigner
    ) public pure returns (bool) {
        bytes32 hash = keccak256(message);
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();
        return verifySignature(ethSignedHash, signature, expectedSigner);
    }
}
```

### 2. Advanced Signature Validation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AdvancedSignatureValidation is ReentrancyGuard {
    using ECDSA for bytes32;

    // Events
    event SignatureUsed(bytes32 indexed sigHash);
    
    // Storage
    mapping(bytes32 => bool) public usedSignatures;
    
    // Custom errors
    error SignatureExpired(uint256 deadline);
    error SignatureAlreadyUsed(bytes32 sigHash);
    error InvalidSignature();

    struct SignedMessage {
        bytes message;
        uint256 nonce;
        uint256 deadline;
        address signer;
    }

    function verifySignedMessage(
        SignedMessage calldata message,
        bytes calldata signature
    ) public nonReentrant returns (bool) {
        // Check deadline
        if (message.deadline < block.timestamp) {
            revert SignatureExpired(message.deadline);
        }

        // Create message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                message.message,
                message.nonce,
                message.deadline,
                address(this) // Prevent cross-contract replay
            )
        );

        // Create Ethereum signed message hash
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Check if signature already used
        if (usedSignatures[ethSignedMessageHash]) {
            revert SignatureAlreadyUsed(ethSignedMessageHash);
        }

        // Recover signer
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        if (recoveredSigner != message.signer) {
            revert InvalidSignature();
        }

        // Mark signature as used
        usedSignatures[ethSignedMessageHash] = true;
        emit SignatureUsed(ethSignedMessageHash);

        return true;
    }
}
```

### 3. EIP-712 Typed Data Signing

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EIP712Validation {
    // EIP-712 Domain
    bytes32 public DOMAIN_SEPARATOR;
    
    // Type hashes
    bytes32 public constant TRANSACTION_TYPEHASH = keccak256(
        "Transaction(address to,uint256 value,uint256 nonce,uint256 deadline)"
    );

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("MyContract")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    struct EIP712Transaction {
        address to;
        uint256 value;
        uint256 nonce;
        uint256 deadline;
    }

    function hashTransaction(
        EIP712Transaction calldata transaction
    ) public view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        TRANSACTION_TYPEHASH,
                        transaction.to,
                        transaction.value,
                        transaction.nonce,
                        transaction.deadline
                    )
                )
            )
        );
    }
}
```

## Security Considerations

### 1. Replay Attack Prevention

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ReplayProtection {
    // Nonce tracking
    mapping(address => uint256) public nonces;
    
    // Used signatures tracking
    mapping(bytes32 => bool) public usedSignatures;

    function verifyWithReplayProtection(
        bytes32 hash,
        bytes memory signature,
        address signer
    ) public returns (bool) {
        require(!usedSignatures[hash], "Signature already used");
        
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                hash
            )
        );

        address recoveredSigner = recoverSigner(ethSignedHash, signature);
        require(recoveredSigner == signer, "Invalid signature");

        usedSignatures[hash] = true;
        nonces[signer]++;

        return true;
    }

    function recoverSigner(
        bytes32 ethSignedHash,
        bytes memory signature
    ) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        return ecrecover(ethSignedHash, v, r, s);
    }
}
```

### 2. Signature Malleability Prevention

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MalleabilityPrevention {
    uint256 constant private HALF_CURVE_ORDER = 
        0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0;

    function validateSignature(
        bytes memory signature
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(signature.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        // Prevent signature malleability
        require(
            uint256(s) <= HALF_CURVE_ORDER,
            "Invalid s value"
        );
        require(v == 27 || v == 28, "Invalid v value");

        return (r, s, v);
    }
}
```

## Testing Strategies

### 1. Unit Tests

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signature Validation", function () {
    let signatureValidator;
    let owner;
    let signer;

    beforeEach(async function () {
        [owner, signer] = await ethers.getSigners();
        
        const SignatureValidator = await ethers.getContractFactory(
            "AdvancedSignatureValidation"
        );
        signatureValidator = await SignatureValidator.deploy();
    });

    it("Should verify valid signature", async function () {
        const message = {
            message: ethers.utils.toUtf8Bytes("Hello World"),
            nonce: 1,
            deadline: Math.floor(Date.now() / 1000) + 3600,
            signer: signer.address
        };

        const messageHash = ethers.utils.solidityKeccak256(
            ["bytes", "uint256", "uint256", "address"],
            [
                message.message,
                message.nonce,
                message.deadline,
                signatureValidator.address
            ]
        );

        const signature = await signer.signMessage(
            ethers.utils.arrayify(messageHash)
        );

        expect(
            await signatureValidator.verifySignedMessage(message, signature)
        ).to.be.true;
    });
});
```

### 2. Integration Tests

```javascript
describe("EIP-712 Signature", function () {
    it("Should verify typed data signature", async function () {
        const domain = {
            name: "MyContract",
            version: "1",
            chainId: network.config.chainId,
            verifyingContract: signatureValidator.address
        };

        const types = {
            Transaction: [
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" }
            ]
        };

        const value = {
            to: recipient.address,
            value: ethers.utils.parseEther("1"),
            nonce: 1,
            deadline: Math.floor(Date.now() / 1000) + 3600
        };

        const signature = await signer._signTypedData(domain, types, value);
        
        expect(
            await signatureValidator.verifyEIP712Signature(value, signature)
        ).to.be.true;
    });
});
```

## Common Vulnerabilities

### 1. Timestamp Dependence

```solidity
contract TimestampVulnerability {
    // BAD: Tight deadline check
    function verifyTimestamp(uint256 deadline) external view {
        require(
            block.timestamp == deadline,
            "Invalid timestamp"
        );
    }

    // GOOD: Deadline window
    function verifyTimestampSafe(uint256 deadline) external view {
        require(
            block.timestamp <= deadline,
            "Expired deadline"
        );
    }
}
```

### 2. Insufficient Replay Protection

```solidity
contract ReplayVulnerability {
    // BAD: No replay protection
    function processSignature(bytes memory signature) external {
        // Direct processing without checks
    }

    // GOOD: With replay protection
    mapping(bytes32 => bool) public usedSignatures;
    
    function processSignatureSafe(
        bytes memory signature
    ) external {
        bytes32 sigHash = keccak256(signature);
        require(
            !usedSignatures[sigHash],
            "Signature already used"
        );
        usedSignatures[sigHash] = true;
    }
}
```

## References

1. Ethereum Documentation
   - [EIP-191: Signed Data Standard](https://eips.ethereum.org/EIPS/eip-191)
   - [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)

2. OpenZeppelin
   - [ECDSA.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/ECDSA.sol)
   - [EIP712.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/EIP712.sol)

3. Security Resources
   - [Consensys Best Practices](https://consensys.github.io/smart-contract-best-practices/)
   - [SWC Registry - Signature Malleability](https://swcregistry.io/docs/SWC-117)

4. Tools
   - [eth-sig-util](https://github.com/MetaMask/eth-sig-util)
   - [ethers.js Signing](https://docs.ethers.io/v5/api/signer/#Signer-signMessage)
