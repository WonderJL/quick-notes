
# UUPS Proxy Pattern (EIP-1822)

## Document Purpose
This document provides an in-depth study note on the **UUPS (Universal Upgradeable Proxy Standard) Proxy Pattern** as defined by **EIP-1822**. It is structured to be engineer-friendly, including explanations, example code, and comments for clarity. This document is intended for record-keeping and understanding of the UUPS pattern in creating upgradeable contracts.

---

## Introduction to the UUPS Proxy Pattern

The **UUPS (Universal Upgradeable Proxy Standard) Proxy Pattern** is a widely used pattern for creating upgradeable contracts in Solidity. Unlike the Transparent Proxy Pattern, the UUPS pattern places the **upgrade logic within the implementation contract itself** rather than in the proxy. This approach reduces the complexity and gas costs of the proxy contract.

### Key Advantages of the UUPS Proxy Pattern

1. **Simplified Proxy Contract**:
   - The UUPS proxy is simpler and lighter since it does not manage upgrades directly.

2. **Self-Managed Upgrades**:
   - The implementation contract defines and manages its own upgrades, providing flexibility and reducing proxy overhead.

3. **Compatibility with EIP-1822**:
   - Following EIP-1822 ensures consistency across UUPS proxies and compatibility with widely used libraries, such as OpenZeppelin.

---

## How the UUPS Proxy Pattern Works

1. **Proxy Contract**:
   - A lightweight contract that delegates all calls to the implementation.
   - The proxy itself does not control the upgrade process.

2. **Implementation Contract**:
   - Contains both the business logic and the upgrade mechanism (`upgradeTo` function).
   - Defines how to upgrade itself using an internal function to store the new implementation.

3. **EIP-1822 Storage Slot**:
   - The implementation address is stored in a specific storage slot (`0x3608...bbc`) as per EIP-1822, ensuring consistency and compatibility across UUPS-based proxies.

---

## Code Example: UUPS Proxy Pattern

### Step 1: Implementation Contract (V1)

In this example, the implementation contract has a basic counter and an `initialize` function to set up initial values. The `upgradeTo` function manages the upgrade process.

```solidity
// MyImplementationV1.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyImplementationV1 {
    uint256 public count;

    // Initialize function to set initial state
    function initialize(uint256 _count) public {
        count = _count;
    }

    // Function to increment the count
    function increment() public {
        count += 1;
    }

    // UUPS upgrade function to manage upgrades
    function upgradeTo(address newImplementation) public {
        require(msg.sender == address(this), "Only contract itself can upgrade");
        _upgradeTo(newImplementation);
    }

    // Internal function to store the new implementation address
    function _upgradeTo(address newImplementation) internal {
        assembly {
            sstore(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc, newImplementation)
        }
    }
}
```

### Step 2: Minimal Proxy Contract (UUPS Proxy)

The UUPS proxy contract is minimal and only forwards calls to the implementation address stored in the EIP-1822 storage slot.

```solidity
// UUPSProxy.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UUPSProxy {
    // Constructor to set the initial implementation address
    constructor(address initialImplementation) {
        _upgradeTo(initialImplementation);
    }

    // Internal function to set new implementation
    function _upgradeTo(address newImplementation) internal {
        assembly {
            sstore(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc, newImplementation)
        }
    }

    fallback() external payable {
        // Fetch the current implementation address
        address impl;
        assembly {
            impl := sload(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc)
        }

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

## Upgrading the Contract to a New Implementation (V2)

To upgrade the implementation, we define a new contract `MyImplementationV2` with additional functionality and use the `upgradeTo` function.

#### New Implementation Contract (V2)

```solidity
// MyImplementationV2.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyImplementationV2 {
    uint256 public count;

    function initialize(uint256 _count) public {
        count = _count;
    }

    function increment() public {
        count += 1;
    }

    function decrement() public {
        count -= 1;
    }

    function upgradeTo(address newImplementation) public {
        require(msg.sender == address(this), "Only contract itself can upgrade");
        _upgradeTo(newImplementation);
    }

    function _upgradeTo(address newImplementation) internal {
        assembly {
            sstore(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc, newImplementation)
        }
    }
}
```

### Upgrade Process

1. **Deploy `MyImplementationV2`** with the new logic.
2. **Use `upgradeTo(newImplementationAddress)`** to switch to the new implementation.
3. **The proxy contract** now uses `MyImplementationV2`, while storage remains intact in the proxy.

---

## Pros and Cons of the UUPS Proxy Pattern

**Pros**:
- **Lightweight Proxy**: Simplifies the proxy and reduces gas costs by managing upgrades within the implementation.
- **Self-Managed Upgrades**: The implementation handles upgrades, giving more flexibility for different implementations.

**Cons**:
- **Risk of Irreversible Mistakes**: A faulty upgrade function in the implementation could prevent future upgrades.
- **No External Admin Role**: Since the upgrade logic is in the implementation, there’s no separate admin control in the proxy.

---

## References

- [EIP-1822: Universal Upgradeable Proxy Standard](https://eips.ethereum.org/EIPS/eip-1822)
- [OpenZeppelin's UUPS Upgradeable Proxy Documentation](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)

---

## Conclusion

The UUPS Proxy Pattern (EIP-1822) provides an efficient approach to creating upgradeable contracts. By placing the upgrade logic in the implementation, it reduces the proxy’s complexity, making it lightweight and gas-efficient. However, careful management of the upgrade function is essential to avoid potential upgrade locks.

---
