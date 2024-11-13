# Add these to the existing Makefile

# Network Variables
NETWORK ?= $(shell grep NETWORK .env | cut -d '=' -f2 || echo "localhost")
DEPLOY_ARGS ?=

# Network groups
MAINNETS = mainnet polygon optimism arbitrum
TESTNETS = sepolia goerli mumbai optimism-goerli arbitrum-goerli
LOCAL_NETS = hardhat localhost

# Network commands
.PHONY: list-networks
list-networks: ## List all available networks
	@echo "$(CYAN)Available Networks:$(RESET)"
	@echo "$(YELLOW)Mainnets:$(RESET) $(MAINNETS)"
	@echo "$(YELLOW)Testnets:$(RESET) $(TESTNETS)"
	@echo "$(YELLOW)Local:$(RESET) $(LOCAL_NETS)"
	@echo "\nCurrent network: $(NETWORK)"

.PHONY: check-network
check-network: ## Validate current network settings
	@echo "$(CYAN)Checking network configuration...$(RESET)"
	@if [ "$(NETWORK)" = "mainnet" ]; then \
		echo "$(RED)⚠️  WARNING: You are on mainnet! ⚠️$(RESET)"; \
		read -p "Are you sure you want to continue? [y/N] " confirm && echo $$confirm | grep -iq "^y"; \
	fi

.PHONY: deploy-dry-run
deploy-dry-run: ## Perform a dry run deployment
	@echo "$(CYAN)Performing dry run deployment on $(NETWORK)...$(RESET)"
	$(HARDHAT) run scripts/deploy.ts --network $(NETWORK) --dry-run

.PHONY: deploy-with-verify
deploy-with-verify: check-network ## Deploy and verify contract
	@echo "$(CYAN)Deploying to $(NETWORK)...$(RESET)"
	$(HARDHAT) run scripts/deploy.ts --network $(NETWORK) $(DEPLOY_ARGS)
	@echo "$(YELLOW)Waiting for deployment confirmation...$(RESET)"
	sleep 30
	@echo "$(CYAN)Verifying contract...$(RESET)"
	$(MAKE) verify NETWORK=$(NETWORK)

.PHONY: fund-testnet
fund-testnet: ## Get testnet funds from faucet (if available)
	@echo "$(CYAN)Attempting to get testnet funds...$(RESET)"
	@case "$(NETWORK)" in \
		"sepolia") \
			echo "Visit: https://sepoliafaucet.com/";; \
		"goerli") \
			echo "Visit: https://goerlifaucet.com/";; \
		"mumbai") \
			echo "Visit: https://faucet.polygon.technology/";; \
		"optimism-goerli") \
			echo "Visit: https://optimismfaucet.net/";; \
		"arbitrum-goerli") \
			echo "Visit: https://faucet.arbitrum.io/";; \
		*) \
			echo "No faucet available for $(NETWORK)";; \
	esac

.PHONY: prepare-deploy
prepare-deploy: compile lint test security ## Prepare deployment with all checks
	@if [ "$(NETWORK)" = "mainnet" ]; then \
		echo "$(RED)⚠️  Preparing mainnet deployment - Extra checks running...$(RESET)"; \
		$(MAKE) size; \
		$(MAKE) coverage; \
	fi

# Update existing deploy command
.PHONY: deploy
deploy: prepare-deploy check-network ## Deploy with all checks
	@echo "$(CYAN)Deploying to $(NETWORK)...$(RESET)"
	$(HARDHAT) run scripts/deploy.ts --network $(NETWORK) $(DEPLOY_ARGS)

# Gas estimation for network
.PHONY: estimate-gas
estimate-gas: ## Estimate gas costs on current network
	@echo "$(CYAN)Estimating gas costs on $(NETWORK)...$(RESET)"
	REPORT_GAS=true $(HARDHAT) test --network $(NETWORK)

# Network status check
.PHONY: network-status
network-status: ## Check network status and account balance
	@echo "$(CYAN)Checking network status for $(NETWORK)...$(RESET)"
	$(HARDHAT) run scripts/network-status.ts --network $(NETWORK)