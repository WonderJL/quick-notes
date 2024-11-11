# Certora and Alternative Verification Tools

## Table of Contents
1. [Introduction](#introduction)
2. [Certora Overview](#certora)
3. [Local Alternatives](#alternatives)
4. [Tool Comparison](#comparison)
5. [Setup Guides](#setup)
6. [References](#references)

## Introduction <a name="introduction"></a>
Overview of available tools for smart contract formal verification, focusing on Certora and alternatives.

## Certora Overview <a name="certora"></a>

### Setup and Configuration
```bash
# Installation
pip3 install certora-cli

# Environment Setup
export CERTORAKEY='your-api-key'

# Project Structure
my-project/
├── contracts/
│   └── Token.sol
├── spec/
│   └── Token.spec
└── certora.conf
```

### Configuration File
```yaml
# certora.conf
{
  "files": [
    "contracts/Token.sol"
  ],
  "verify": "contracts/Token.sol:Token",
  "spec_file": "spec/Token.spec",
  "solc": "solc8.0"
}
```

### Example Specification
```javascript
// Token.spec
rule transferPreservesTotal(address from, address to, uint256 amount) {
    env e;
    require to != from;
    
    mathint total_before = totalSupply();
    transfer(e, to, amount);
    mathint total_after = totalSupply();
    
    assert total_before == total_after;
}
```

## Local Alternatives <a name="alternatives"></a>

### 1. SMTChecker (Built into Solidity)
```solidity
// Using SMTChecker
pragma solidity ^0.8.0;

/// @custom:invariant totalSupply = sum(balances)
contract Token {
    mapping(address => uint256) balances;
    uint256 totalSupply;

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}

// Compile with SMT checker
// solc --model-checker-engine chc Token.sol
```

### 2. Manticore
```python
# Manticore Example
from manticore.ethereum import ManticoreEVM

def test_token():
    m = ManticoreEVM()
    contract = m.create_contract('Token.sol')

    # Symbolic values
    value = m.make_symbolic_value()
    addr = m.make_symbolic_value()

    # Verify properties
    contract.transfer(addr, value)

    for state in m.ready_states:
        # Check invariants
        balance_sum = 0
        for addr in state.platform.accounts:
            balance_sum += state.platform.get_balance(addr)
        
        assert balance_sum == initial_total_supply
```

### 3. Mythril
```bash
# Installation
pip3 install mythril

# Basic Usage
myth analyze Token.sol
```

## Tool Comparison <a name="comparison"></a>

### Feature Matrix
```plaintext
+----------------+------------+-----------+----------+
| Feature        | Certora    | SMTChecker| Manticore|
+----------------+------------+-----------+----------+
| Local/Cloud    | Cloud      | Local     | Local    |
| Learning Curve | High       | Low       | Medium   |
| Power          | Very High  | Medium    | High     |
| Speed          | Medium     | Fast      | Slow     |
| Cost           | Paid       | Free      | Free     |
+----------------+------------+-----------+----------+
```

## Setup Guides <a name="setup"></a>

### Setting Up SMTChecker
```bash
# Install solc with SMT support
sudo apt-get install solc

# Verify installation
solc --version

# Run verification
solc --model-checker-engine chc Contract.sol
```

### Setting Up Manticore
```bash
# Virtual environment setup
python3 -m venv venv
source venv/bin/activate

# Installation
pip install manticore
pip install solc-select

# Select Solidity version
solc-select install 0.8.0
solc-select use 0.8.0
```

### Setting Up Mythril
```bash
# Installation
pip3 install mythril

# Basic usage
myth analyze Contract.sol --execution-timeout 90
```

## Best Practices for Tool Selection

1. **Project Size**
```plaintext
Small Projects:
- SMTChecker for basic properties
- Mythril for quick security checks

Large Projects:
- Certora for comprehensive verification
- Manticore for detailed analysis
```

2. **Resource Considerations**
```plaintext
Limited Resources:
- Local tools (SMTChecker, Mythril)
- Focus on critical properties

Enterprise Projects:
- Certora
- Multiple tool combination
```

## References <a name="references"></a>

1. [Certora Documentation](https://docs.certora.com/)
2. [Solidity SMTChecker Documentation](https://docs.soliditylang.org/en/latest/smtchecker.html)
3. [Manticore Documentation](https://github.com/trailofbits/manticore)
4. [Mythril Documentation](https://github.com/ConsenSys/mythril)

## Comments

Tool selection should be based on project requirements, budget, and team expertise. A combination of tools often provides the most comprehensive verification coverage.

---
*Note: This document is part of a series on Smart Contract Formal Verification. See other documents for coverage of related topics.*
