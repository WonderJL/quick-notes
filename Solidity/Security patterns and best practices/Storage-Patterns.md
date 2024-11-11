# Ethereum Storage Patterns Guide
*A comprehensive guide for blockchain engineers*

## Table of Contents
1. [Overview](#overview)
2. [Storage Locations](#storage-locations)
3. [Storage Slots and Layout](#storage-slots-and-layout)
4. [Storage Patterns and Optimization](#storage-patterns-and-optimization)
5. [Best Practices](#best-practices)
6. [Interview Questions](#interview-questions)
7. [References](#references)

## Overview
Storage patterns in Ethereum smart contracts are crucial for optimizing gas costs and maintaining data integrity. This guide covers fundamental concepts, implementation patterns, and optimization techniques.

## Storage Locations

### Three Main Types
1. **Storage**
   - Persistent state variables
   - Most expensive gas-wise
   - Lives on the blockchain
   
2. **Memory**
   - Temporary storage
   - Cleared after function execution
   - Lower gas costs
   
3. **Calldata**
   - Read-only
   - Used for function parameters
   - Most gas-efficient

```solidity
// Example demonstrating different storage locations
contract StorageLocations {
    // Storage - persists between function calls
    uint256[] public storageArray;
    
    function example(uint256[] calldata _calldata) public {
        // Memory - temporary during function execution
        uint256[] memory memoryArray = new uint256[](3);
        
        // Storage reference to storage array
        uint256[] storage storageRef = storageArray;
        
        // Calldata - read-only function parameters
        uint256[] calldata calldataRef = _calldata;
    }
}
```

## Storage Slots and Layout

### Slot Assignment Rules
1. Fixed-size variables are assigned contiguous slots
2. Dynamic arrays store length in slot n, data at keccak256(n)
3. Mappings store values at keccak256(key . slot_number)

```solidity
// Example demonstrating storage layout
contract StorageLayout {
    // Fixed-size variables
    uint256 a;        // slot 0
    uint256[2] b;     // slots 1-2
    
    // Dynamic storage
    uint[] c;         // length at slot 3
                      // elements at keccak256(3) + index
    
    // Mapping storage
    mapping(uint => uint) d; // values at keccak256(key . 4)
    
    /* 
     * Storage Layout Visualization:
     * 
     * Slot 0: a (uint256)
     * Slot 1: b[0] (uint256)
     * Slot 2: b[1] (uint256)
     * Slot 3: c.length (uint256)
     * keccak256(3) + i: c[i]
     * keccak256(key . 4): d[key]
     */
}
```

## Storage Patterns and Optimization

### Packed Storage
Solidity automatically packs multiple variables that can fit into a single 32-byte slot.

```solidity
contract PackedStorage {
    // Packed into a single slot (good)
    struct PackedStruct {
        uint8 a;    // 1 byte
        uint8 b;    // 1 byte
        uint16 c;   // 2 bytes
        uint32 d;   // 4 bytes
        address e;  // 20 bytes
    }
    
    // Not packed (inefficient)
    struct UnpackedStruct {
        uint8 a;    // 1 byte but takes full slot
        address b;  // new slot
        uint8 c;    // new slot
    }
}
```

### Mapping vs Array Selection
Choose based on your specific needs:

```solidity
contract StorageChoice {
    // Use mapping when:
    // - O(1) access is needed
    // - No iteration required
    // - Key-based lookup
    mapping(address => uint256) balances;
    
    // Use array when:
    // - Need to iterate
    // - Need length
    // - Need ordered elements
    address[] userList;
    
    // Common hybrid pattern
    mapping(address => bool) isRegistered;
    address[] registeredUsers;
}
```

## Best Practices

1. **Pack Variables Efficiently**
   ```solidity
   // Good
   struct User {
       uint8 age;
       uint8 score;
       address wallet;
   }
   
   // Bad
   struct User {
       uint8 age;
       address wallet;
       uint8 score;
   }
   ```

2. **Use Appropriate Data Types**
   ```solidity
   // Good
   uint8 age;          // 0-255 is sufficient
   uint32 timestamp;   // Unix timestamp fits in uint32
   
   // Bad
   uint256 age;        // Wastes storage
   uint256 timestamp;  // Unnecessarily large
   ```

3. **Optimize Struct Layout**
   ```solidity
   // Good: packed into minimum slots
   struct OptimizedStruct {
       uint8[4] smallInts;    // 4 bytes
       uint32 mediumInt;      // 4 bytes
       address addr;          // 20 bytes
       // Total: 28 bytes (fits in one slot)
   }
   ```

## Interview Questions

1. **Q**: How does packed storage work in Solidity?
   **A**: Solidity automatically packs variables into 32-byte slots when possible. Variables are packed from right to left if they can fit together, reducing gas costs by minimizing storage operations.

2. **Q**: What's the difference between memory and storage?
   **A**: Storage is permanent and expensive, persisting on the blockchain. Memory is temporary and cheaper, existing only during function execution.

3. **Q**: How would you optimize a struct for minimal gas usage?
   **A**: Pack similar-sized variables together, use appropriate data types (uint8 instead of uint256 when possible), and order variables to minimize slots used.

4. **Q**: Explain storage slots calculation.
   **A**: Fixed-size variables use contiguous slots. Dynamic arrays store length at slot n and data at keccak256(n). Mappings store values at keccak256(key . slot_number).

5. **Q**: When to use mapping vs array?
   **A**: Use mappings for O(1) key-based lookup without iteration needs. Use arrays when iteration, ordering, or length awareness is required.

## References

1. Solidity Documentation: [Storage Layout](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html)
2. OpenZeppelin Contracts: [Storage Pattern Examples](https://github.com/OpenZeppelin/openzeppelin-contracts)
3. Ethereum Improvement Proposals: [EIP-1967: Standard Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)
4. Ethereum Stack Exchange: [Storage Patterns Discussion](https://ethereum.stackexchange.com/)

---
*Last Updated: November 10, 2024*
