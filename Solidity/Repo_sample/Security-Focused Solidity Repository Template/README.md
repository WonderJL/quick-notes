# Security-Focused Solidity Repository Template

A production-grade template for Solidity smart contract development with comprehensive security tooling, best practices integration, automated workflows, and multi-network deployment support.

## Table of Contents
- [Features Overview](#features-overview)
- [Quick Start](#quick-start)
- [Network Configuration](#network-configuration)
- [Development Workflows](#development-workflows)
- [Security Tools](#security-tools)
- [Deployment Workflows](#deployment-workflows)
- [Advanced Usage](#advanced-usage)
- [Limitations & Assumptions](#limitations--assumptions)
- [Contributing](#contributing)
- [License](#license)

## Features Overview

- 🔒 Multi-layered security testing (Echidna, Slither)
- 🌐 Multi-network support (Ethereum, Polygon, Optimism, Arbitrum)
- 🛡️ Network-specific safety checks
- 🚀 Automated deployment workflows
- ⚡ Gas optimization features
- 🐳 Docker integration
- 📊 Comprehensive testing framework
- 🔍 Built-in auditing tools

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd <repository-name>
make setup

# Configure networks
cp .env.example .env
# Edit .env with your API keys and private key

# Run full test suite
make ci

# Deploy to testnet
make deploy NETWORK=sepolia
```

## Network Configuration

### Supported Networks

#### Mainnets
- Ethereum (mainnet)
- Polygon (polygon)
- Optimism (optimism)
- Arbitrum One (arbitrum)

#### Testnets
- Sepolia (sepolia)
- Goerli (goerli)
- Polygon Mumbai (mumbai)
- Optimism Goerli (optimism-goerli)
- Arbitrum Goerli (arbitrum-goerli)

#### Local Networks
- Hardhat Network (hardhat)
- Local Node (localhost)

### Network Configuration

```bash
# List available networks
make list-networks

# Check current network status
make network-status NETWORK=sepolia

# Get testnet funds
make fund-testnet NETWORK=sepolia
```

### Environment Setup

Required environment variables in `.env`:
```env
# Network APIs
ALCHEMY_API_KEY=your_key
INFURA_API_KEY=your_key

# Explorer APIs
ETHERSCAN_API_KEY=your_key
POLYGONSCAN_API_KEY=your_key
OPTIMISM_API_KEY=your_key
ARBISCAN_API_KEY=your_key

# Deployment
PRIVATE_KEY=your_private_key
NETWORK=desired_network
```

## Development Workflows

### 1. Initial Setup

```bash
make setup
make install-security
```

### 2. Network-Specific Development

```bash
# Start local network
make node

# Check network status
make network-status NETWORK=localhost

# Run tests on specific network
make test NETWORK=hardhat
```

### 3. Security Checks

```bash
# Run all security tools
make security

# Network-specific gas estimation
make estimate-gas NETWORK=optimism-goerli
```

## Deployment Workflows

### 1. Preparation

```bash
# Prepare for deployment (includes all checks)
make prepare-deploy NETWORK=sepolia
```

### 2. Deployment Options

```bash
# Regular deployment
make deploy NETWORK=goerli

# Deployment with verification
make deploy-with-verify NETWORK=sepolia

# Dry run deployment
make deploy-dry-run NETWORK=mumbai
```

### 3. Post-Deployment

```bash
# Verify contract
make verify NETWORK=sepolia CONTRACT_ADDRESS=0x...

# Check deployment status
make network-status NETWORK=sepolia
```

### 4. Network Safety Features

- Mainnet deployment warnings
- Gas estimation checks
- Balance verifications
- Network-specific optimizations

## Security Tools

### 1. Network-Specific Security Checks

```bash
# Run security checks for specific network
make security NETWORK=mainnet
```

### 2. Gas Optimization

```bash
# Check contract sizes
make size

# Generate gas report
make gas-report NETWORK=optimism
```

### 3. Automated Auditing

```bash
# Prepare audit materials
make audit-prep NETWORK=mainnet
```

## Advanced Usage

### Custom Network Configuration

```typescript
// hardhat.config.ts
networks: {
  custom_network: {
    url: process.env.CUSTOM_NETWORK_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: parseInt(process.env.CUSTOM_CHAIN_ID)
  }
}
```

### Network-Specific Deployment Arguments

```bash
make deploy NETWORK=sepolia DEPLOY_ARGS="--arg1 value1 --arg2 value2"
```

### Gas Price Management

```bash
# Check current gas prices
make network-status NETWORK=mainnet

# Deploy with custom gas price
make deploy NETWORK=polygon DEPLOY_ARGS="--gas-price 50000000000"
```

## Limitations & Assumptions

### Network-Specific Limitations

1. **API Dependencies**
   - Requires API keys for each network
   - Rate limits on testnet APIs
   - RPC endpoint reliability

2. **Network Constraints**
   - Different gas models per network
   - Varying block times
   - Network-specific contract size limits

### Development Requirements

1. **Local Setup**
   - Node.js >=14.0.0
   - Access to network RPC endpoints
   - Sufficient testnet tokens

2. **Security Considerations**
   - Network-specific security models
   - Cross-chain compatibility issues
   - Gas price volatility

## Future Enhancements

1. **Network Support**
   - [ ] Layer 2 optimizations
   - [ ] Cross-chain deployment tools
   - [ ] Network-specific testing frameworks

2. **Deployment Features**
   - [ ] Multi-network deployment orchestration
   - [ ] Automatic gas price strategies
   - [ ] Deployment verification improvements

3. **Security Enhancements**
   - [ ] Network-specific security profiles
   - [ ] Cross-chain security analysis
   - [ ] Gas optimization suggestions

## Contributing

1. Fork and clone
2. Create feature branch
3. Make changes
4. Test on multiple networks:
   ```bash
   make test NETWORK=hardhat
   make test NETWORK=sepolia
   ```
5. Create Pull Request

## Support

- Network Issues: Check network status first
- Deployment Problems: Verify network configuration
- Security Concerns: Run full security suite

## License

MIT License. See LICENSE file for details.

---

Remember to:
1. Never commit private keys
2. Always test on testnets first
3. Verify network configuration before deployment
4. Check gas prices before mainnet transactions

For the latest updates and network additions, check our documentation.