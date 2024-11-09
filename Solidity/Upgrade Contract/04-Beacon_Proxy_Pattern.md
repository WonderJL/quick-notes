
# Beacon Proxy Pattern

## Document Purpose
This document provides a detailed study note on the **Beacon Proxy Pattern** in Solidity. The content is structured to be reader-friendly and engineer-focused, providing a comprehensive look at the beacon pattern, code examples, and explanations. This document serves as a guide for understanding how to use the Beacon Proxy Pattern to manage multiple upgradeable proxies.

---

## Introduction to the Beacon Proxy Pattern

The **Beacon Proxy Pattern** is a design pattern for creating upgradeable contracts that need **multiple instances** of the same logic but with **independent storage**. It is particularly useful when several proxies should share the same implementation, such as in a factory of tokens or other entities where each instance operates with unique data.

### Key Advantages of the Beacon Proxy Pattern

1. **Efficient Upgrades Across Multiple Proxies**:
   - The beacon allows upgrading a single implementation contract, which then affects all proxy instances referencing it.

2. **Independent Storage for Each Proxy**:
   - Each proxy instance maintains its own storage, making this pattern suitable for cases where multiple independent instances share the same logic.

3. **Beacon-Controlled Implementation**:
   - The beacon acts as a centralized manager for the implementation, allowing upgrades to be managed in one location.

---

## How the Beacon Proxy Pattern Works

1. **Beacon Contract**:
   - Holds the address of the current implementation.
   - Controls upgrades across all proxies that point to it.

2. **Beacon Proxy Contract**:
   - Each proxy instance points to the beacon rather than directly to the implementation.
   - Retrieves the current implementation from the beacon and uses `delegatecall` to interact with it.

3. **Implementation Contract**:
   - Contains the actual business logic for the contract.
   - When the beacon is upgraded to a new implementation, all proxy instances automatically use the new logic.

---

## Code Example: Beacon Proxy Pattern

### Step 1: Implementation Contract (V1)

This contract contains basic counter functionality and includes an `initialize` function to set the initial state.

```solidity
// MyImplementationV1.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyImplementationV1 {
    uint256 public count;

    // Initialize function to set the initial state
    function initialize(uint256 _count) public {
        count = _count;
    }

    // Function to increment the count
    function increment() public {
        count += 1;
    }
}
```

### Step 2: Beacon Contract

The beacon holds the current implementation address and allows the admin to upgrade the implementation.

```solidity
// Beacon.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Beacon {
    address public implementation;
    address public admin;

    // Constructor to set the initial implementation and admin
    constructor(address initialImplementation) {
        implementation = initialImplementation;
        admin = msg.sender;
    }

    // Upgrade function only callable by the admin
    function upgradeTo(address newImplementation) public {
        require(msg.sender == admin, "Only admin can upgrade");
        implementation = newImplementation;
    }
}
```

- **Constructor**: Initializes the beacon with an initial implementation and sets the admin.
- **upgradeTo**: Allows the admin to update the implementation address, impacting all beacon proxies.

### Step 3: Beacon Proxy Contract

Each **Beacon Proxy** instance points to the beacon and retrieves the implementation address. This contract forwards all calls to the current implementation using `delegatecall`.

```solidity
// BeaconProxy.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BeaconProxy {
    address public beacon;

    // Constructor to set the beacon address
    constructor(address _beacon) {
        beacon = _beacon;
    }

    // Fallback function to handle all calls to the implementation
    fallback() external payable {
        address impl = Beacon(beacon).implementation();
        require(impl != address(0), "Implementation not set");

        // Delegate call to the implementation
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}
```

---

## Using the Beacon Proxy Pattern

1. **Deploy the Implementation Contract**:
   - Deploy `MyImplementationV1` containing the initial business logic.

2. **Deploy the Beacon Contract**:
   - Deploy `Beacon`, setting `MyImplementationV1` as the initial implementation.

3. **Deploy Beacon Proxies**:
   - Deploy each instance of `BeaconProxy`, pointing it to the beacon. Each instance has its own independent storage.

4. **Upgrade the Implementation**:
   - To upgrade, deploy a new implementation contract (e.g., `MyImplementationV2`) and call `upgradeTo(newImplementationAddress)` on the beacon.

   **All beacon proxies** will now use `MyImplementationV2`, with each instance keeping its unique storage.

---

## Pros and Cons of the Beacon Proxy Pattern

**Pros**:
- **Single Point of Upgrade**: Allows one upgrade to affect all proxies referencing the same beacon.
- **Independent Storage**: Each beacon proxy has its own storage, ideal for cases like multiple token contracts or unique user instances.

**Cons**:
- **Single Point of Failure**: Since all proxies depend on the same implementation in the beacon, an error in the implementation affects all proxies.
- **Complexity in Management**: Involves three components (beacon, proxy, and implementation), increasing deployment and management complexity.

---

## References

- [OpenZeppelin's Beacon Proxy Documentation](https://docs.openzeppelin.com/contracts/4.x/api/proxy#BeaconProxy)
- [Ethereum Delegatecall Documentation](https://docs.soliditylang.org/en/v0.8.6/introduction-to-smart-contracts.html#delegatecall)

---

## Conclusion

The Beacon Proxy Pattern is ideal for cases where multiple instances of a contract need the same logic but have unique storage states. It offers efficient upgrades across multiple proxies, centralizing control in the beacon while maintaining flexibility for multiple instances.

---
