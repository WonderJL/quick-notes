# Model Checking vs Theorem Proving in Smart Contract Verification

## Table of Contents
1. [Introduction](#introduction)
2. [Model Checking](#model-checking)
3. [Theorem Proving](#theorem-proving)
4. [Comparison](#comparison)
5. [Use Cases](#use-cases)
6. [References](#references)

## Introduction <a name="introduction"></a>
Understanding the differences between model checking and theorem proving is crucial for choosing the right verification approach for smart contracts.

## Model Checking <a name="model-checking"></a>

### Basic Concept
Model checking explores all possible states of a system to verify properties.

```solidity
// Example Contract for Model Checking
contract Lockbox {
    bool locked = false;
    uint256 unlockTime;
    
    function lock(uint256 _duration) public {
        require(!locked);
        locked = true;
        unlockTime = block.timestamp + _duration;
    }
    
    function unlock() public {
        require(block.timestamp >= unlockTime);
        locked = false;
    }
}

// State Space Representation
States = {
    S1: {locked: false, unlockTime: 0},
    S2: {locked: true, unlockTime: 100},
    S3: {locked: true, unlockTime: 200}
}

// Transitions
T1: S1 -> S2 (lock(100))
T2: S1 -> S3 (lock(200))
T3: S2 -> S1 (unlock when time >= 100)
T4: S3 -> S1 (unlock when time >= 200)
```

### Key Features
1. **State Space Exploration**
   - Exhaustive checking of states
   - Transition verification
   - Bounded model checking

2. **Property Verification**
```solidity
// Properties to Check
assert always(locked -> unlockTime > block.timestamp)
assert eventually(!locked)
```

## Theorem Proving <a name="theorem-proving"></a>

### Basic Concept
Uses mathematical logic to prove properties about the system.

```solidity
// Theorem Proving Example
Theorem: "Once locked, cannot unlock before unlockTime"

Proof:
1. Given: locked = true
2. Given: current_time < unlockTime
3. From unlock(): require(block.timestamp >= unlockTime)
4. From (2,3): require will fail
5. Therefore: unlock() cannot succeed

// Formal notation
∀ t, state: 
    (state.locked = true ∧ t < state.unlockTime) →
    ¬canUnlock(state, t)
```

### Key Features
1. **Mathematical Reasoning**
   - Logical deduction
   - Universal quantification
   - Invariant proving

2. **Property Specification**
```solidity
// Theorem Example
theorem balanceInvariant {
    ∀ a,b ∈ addresses, v ∈ uint256:
    transfer(a,b,v) →
    sum(balances) = totalSupply
}
```

## Comparison <a name="comparison"></a>

### Model Checking
```plaintext
Advantages:
- Automated
- Finds counterexamples
- Good for finite state systems

Limitations:
- State explosion
- Limited by system size
- Cannot handle infinite states
```

### Theorem Proving
```plaintext
Advantages:
- Handles infinite states
- Proves general properties
- More powerful proofs

Limitations:
- Requires expertise
- Manual effort needed
- Complex specifications
```

## Use Cases <a name="use-cases"></a>

### When to Use Model Checking
```solidity
// Good for state transition systems
contract VotingSystem {
    enum State { NotStarted, Voting, Ended }
    State public state;
    
    // State transitions are perfect for model checking
    function startVoting() public {
        require(state == State.NotStarted);
        state = State.Voting;
    }
}
```

### When to Use Theorem Proving
```solidity
// Good for mathematical properties
contract TokenSystem {
    mapping(address => uint256) balances;
    uint256 totalSupply;
    
    // Mathematical invariants are perfect for theorem proving
    function transfer(address to, uint256 amount) public {
        balances[msg.sender] -= amount;
        balances[to] += amount;
        // Prove: sum of balances = totalSupply
    }
}
```

## References <a name="references"></a>

1. ACM: [Formal Methods in Smart Contract Verification](https://dl.acm.org/)
2. IEEE: [Model Checking for Smart Contracts](https://ieeexplore.ieee.org/)
3. Formal Methods in System Design Journal
4. Runtime Verification Publications

## Comments

The choice between model checking and theorem proving often depends on the specific properties being verified and the system's complexity. Many projects benefit from using both approaches complementarily.

---
*Note: This document is part of a series on Smart Contract Formal Verification. See other documents for coverage of related topics.*
