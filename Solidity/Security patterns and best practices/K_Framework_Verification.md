# K Framework Deep Dive: EVM Verification

## Table of Contents
1. [What is K Framework?](#what-is)
2. [Core Components](#components)
3. [EVM Implementation](#evm)
4. [Practical Examples](#examples)
5. [Step-by-Step Usage](#usage)
6. [References](#references)

## What is K Framework? <a name="what-is"></a>

K Framework is a rewrite-based executable semantic framework designed to create programming language semantics. For Ethereum, it's used to:

1. Formally specify the EVM semantics
2. Verify smart contract bytecode
3. Generate program analysis tools
4. Prove properties about EVM programs

Think of it as a "language to define languages" that can:
- Define what each EVM instruction does
- Specify how the EVM state changes
- Prove properties about smart contracts

## Core Components <a name="components"></a>

### 1. Basic K Syntax
```k
// Example of K syntax
module EVM-CORE
    imports INT
    imports BOOL

    // Define EVM configuration
    configuration
        <T>
            <k> $PGM:ByteCode </k>  // Program to execute
            <stack> .Stack </stack>  // EVM stack
            <memory> .Map </memory>  // EVM memory
            <storage> .Map </storage>// Contract storage
        </T>
```

### 2. Instruction Definitions
```k
// How K defines EVM instructions
rule <k> PUSH1 X => . ... </k>
     <stack> S => X : S </stack>

rule <k> ADD => . ... </k>
     <stack> X : Y : S => (X +Int Y) : S </stack>

rule <k> SSTORE => . ... </k>
     <stack> K : V : S => S </stack>
     <storage> M => M[K <- V] </storage>
```

## EVM Implementation <a name="evm"></a>

### 1. State Representation
```k
// How K represents EVM state
configuration
    <ethereum>
        <evm>
            <output> .Bytes </output>
            <statusCode> 0 </statusCode>
            <callStack> .List </callStack>
            <interimStates> .List </interimStates>
            <touchedAccounts> .Set </touchedAccounts>
            
            <callState>
                <program> 0 </program>
                <jumpDests> .Set </jumpDests>
                <id> 0 </id>
                <caller> 0 </caller>
                <callData> .Bytes </callData>
                <callValue> 0 </callValue>
                
                <wordStack> .WordStack </wordStack>
                <localMem> .Map </localMem>
                <pc> 0 </pc>
                <gas> 0 </gas>
                <memoryUsed> 0 </memoryUsed>
                <callGas> 0 </callGas>
            </callState>
        </evm>
        
        <network>
            <activeAccounts> .Set </activeAccounts>
            <accounts>
                <account multiplicity="*">
                    <acctID> 0 </acctID>
                    <balance> 0 </balance>
                    <code> .Bytes </code>
                    <storage> .Map </storage>
                    <nonce> 0 </nonce>
                </account>
            </accounts>
        </network>
    </ethereum>
```

### 2. Execution Rules
```k
// Example: Transfer Rule
rule [transfer]:
    <k> #transfer ACCT_ID VALUE => . ... </k>
    <account>
        <acctID> ACCT_ID </acctID>
        <balance> BAL => BAL +Int VALUE </balance>
        ...
    </account>
    <account>
        <acctID> CALLER_ID </acctID>
        <balance> BAL' => BAL' -Int VALUE </balance>
        ...
    </account>
    requires BAL' >=Int VALUE
    ensures BAL' -Int VALUE >=Int 0
```

## Practical Examples <a name="examples"></a>

### 1. Verifying an ERC20 Transfer
```k
// ERC20 Transfer Verification
rule [erc20-transfer]:
    <k> #execute ... </k>
    <callData> transfer(To, Amount) </callData>
    <caller> From </caller>
    <storage>
        // Balance mapping
        balances[From] |-> (FromBal => FromBal -Int Amount)
        balances[To] |-> (ToBal => ToBal +Int Amount)
        // Total supply remains constant
        totalSupply |-> Total
    </storage>
    requires FromBal >=Int Amount
    ensures FromBal -Int Amount >=Int 0
    ensures ToBal +Int Amount <=Int MAX_UINT256
```

### 2. Verifying a Safe Math Operation
```k
// Safe Math Verification
rule [safe-add]:
    <k> PUSH X ; PUSH Y ; ADD => X +Int Y ... </k>
    <stack> S => (X +Int Y) : S </stack>
    requires X +Int Y <=Int MAX_UINT256
    ensures X +Int Y >=Int 0
```

## Step-by-Step Usage <a name="usage"></a>

### 1. Installation and Setup
```bash
# Clone KEVM repository
git clone https://github.com/kframework/evm-semantics
cd evm-semantics

# Build K Framework
make deps
make build
```

### 2. Writing Specifications
```k
// Example specification file: mycontract.k
requires "evm.k"

module MYCONTRACT-SPEC
    imports EVM

    // Specification for a function
    rule [function-spec]:
        <k> #execute ... </k>
        <callData> functionName(Params) </callData>
        <storage> ... 
            KEY |-> (OLD => NEW)
        ... </storage>
        
        requires CONDITIONS
        ensures PROPERTIES
endmodule
```

### 3. Running Verification
```bash
# Compile contract
solc --combined-json=abi,bin,bin-runtime contract.sol > contract.json

# Run K verification
kevm prove mycontract.k
```

### 4. Interpreting Results
```text
// K Framework output examples:

#Success:
- Proof succeeded
- All paths satisfy specification

#Failure:
- Counterexample found
- Path condition: ...
- Storage state: ...
```

## Common Use Cases

1. **Security Properties**
```k
// Verify no overflow occurs
rule [no-overflow]:
    <k> PUSH X ; PUSH Y ; ADD => . ... </k>
    requires X +Int Y <=Int MAX_UINT256

// Verify access control
rule [only-owner]:
    <k> #execute ... </k>
    <caller> CALLER_ID </caller>
    <storage> owner |-> OWNER_ID ... </storage>
    requires CALLER_ID ==Int OWNER_ID
```

2. **Business Logic**
```k
// Verify business rules
rule [valid-transfer]:
    <k> #execute ... </k>
    <callData> transfer(To, Amount) </callData>
    requires Amount >Int 0
    requires To =/=Int 0
```

## References <a name="references"></a>

1. [K Framework Official Documentation](https://kframework.org)
2. [KEVM Technical Report](https://www.ideals.illinois.edu/handle/2142/97207)
3. [Runtime Verification Resources](https://runtimeverification.com/blog)
4. [Ethereum Foundation K Framework Research](https://ethereum.org/en/developers/docs/evm/)

## Comments

K Framework is powerful but has a steep learning curve. It's most valuable for:
- Critical infrastructure contracts
- Novel DeFi protocols
- Security-critical applications
- Standard reference implementations

Best used in conjunction with other verification tools and traditional testing.

---
*Note: This document provides an in-depth look at the K Framework. For practical applications, consider starting with simpler verification tools first.*
