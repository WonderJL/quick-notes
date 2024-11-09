
# Solidity Storage Optimization: Mappings vs Arrays

In Solidity, choosing between mappings and arrays affects gas efficiency significantly. This guide explores various storage patterns and offers techniques to optimize storage and reduce gas costs.

## Key Concepts

### A. Mapping vs Array Storage Patterns

Mappings and arrays have distinct gas costs and storage characteristics. Choosing the right structure based on use case is essential.

#### Example

```solidity
contract StoragePatterns {
    // Array Pattern - Expensive for large datasets
    struct User {
        uint256 id;
        string name;
        bool active;
    }
    User[] public users;
    
    // Mapping Pattern - More gas efficient for lookups
    mapping(uint256 => User) public userMap;
    
    // Even more efficient - Split mapping pattern
    mapping(uint256 => string) public userNames;
    mapping(uint256 => bool) public userStatus;
}
```

#### Explanation

- **Array Pattern:** Arrays are gas-intensive for large datasets as they require iterating over elements.
- **Mapping Pattern:** Mappings provide efficient lookups, making them better suited for larger datasets.
- **Split Mapping Pattern:** Breaking down attributes into separate mappings allows more efficient, selective data access.

---

### B. Nested Mapping Optimization

Using complex structures in nested mappings can increase gas costs, but breaking them into simpler mappings offers efficiency gains.

#### Example

```solidity
contract NestedMappings {
    // Less efficient - Complex struct in mapping
    mapping(address => mapping(uint256 => struct {
        uint256 amount;
        uint256 timestamp;
        bool processed;
    })) public complexData;
    
    // More efficient - Split mappings
    mapping(address => mapping(uint256 => uint256)) public amounts;
    mapping(address => mapping(uint256 => uint256)) public timestamps;
    mapping(address => mapping(uint256 => bool)) public processed;
}
```

#### Explanation

- **Complex Struct in Mapping:** Storing multiple attributes in a struct within a mapping increases gas costs.
- **Split Mappings:** Separating each attribute into its own mapping allows specific attribute access, reducing gas use.

---

### C. Advanced Mapping Patterns for Enumeration

Mappings cannot be iterated directly in Solidity. Using additional patterns, mappings can be made iterable.

#### Example

```solidity
contract EnumerableMapping {
    mapping(uint256 => address) public idToAddress;
    mapping(address => uint256) public addressToId;
    uint256[] public ids;
    
    function add(address _address) external {
        uint256 id = ids.length;
        ids.push(id);
        idToAddress[id] = _address;
        addressToId[_address] = id;
    }
    
    function getAddresses() external view returns (address[] memory) {
        address[] memory addresses = new address[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            addresses[i] = idToAddress[ids[i]];
        }
        return addresses;
    }
}
```

#### Explanation

This pattern combines dual mappings with an array to enable efficient enumeration.

---

### D. Deletion Patterns

Deleting elements in arrays can be gas-intensive. The following pattern provides an efficient way to delete elements without leaving gaps.

#### Example

```solidity
contract DeletionPatterns {
    mapping(uint256 => uint256) public values;
    uint256[] public valueIndex;
    
    // Efficient deletion pattern
    function remove(uint256 _index) external {
        require(_index < valueIndex.length, "Index out of bounds");
        
        // Move the last element to the deleted position
        valueIndex[_index] = valueIndex[valueIndex.length - 1];
        values[_index] = values[valueIndex.length - 1];
        
        // Remove the last element
        valueIndex.pop();
    }
}
```

#### Explanation

The last array element is moved to the deleted element's place, preserving order without creating gaps, which optimizes deletion gas costs.

---

## Technical Considerations

- **Mappings Do Not Track Length:** Mappings cannot track the number of items stored; an auxiliary data structure is needed for enumeration.
- **Mappings Are Non-Iterable by Default:** Mappings lack built-in iteration; patterns such as enumerable mappings are required.
- **Array Order Maintenance:** Arrays maintain element order but have higher gas costs for insertion and deletion.
- **Partial Data Access with Split Mappings:** When only some attributes are accessed frequently, split mappings offer better gas efficiency.

---

## References

1. [Solidity Documentation on Mappings and Arrays](https://docs.soliditylang.org/en/latest/types.html#mappings)
2. [Gas Optimization Techniques in Ethereum](https://ethereum.org/en/developers/docs/)

---

Using these optimization techniques can improve contract performance and significantly reduce gas costs.
