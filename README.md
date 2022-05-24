# Pre Requisites
Install required library:

```sh
sudo apt-get install libudev-dev cargo
```

Install Rust:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Install `solana cli tool` **[(See solana-cli usage)](https://docs.solana.com/cli/usage)**
```sh
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

Install `spl-token-cli`
```sh
cargo install spl-token-cli
```

Next, create new keypair
```sh
solana-keygen new --outfile ~/.config/solana/devnet.json
```

You will get:
- path to ID: `~/.config/solana/devnet.json`
- pubkey: `A8wk...Xu` [you can see it by typing `solana-keygen pubkey`]
- passphrase to recover your new keypair: `throw board ... lawn response`. **Store it!**

Next, say solana to use generated key and set network to devnet
```sh
solana config set --keypair ~/.config/solana/devnet.json --url https://api.devnet.solana.com
```

Next, add balance (run in additional window, it will take long time):
```sh
for i in {1..25}; do solana airdrop 1; sleep 1; done
```

```sh
cd js; 
npm install; 
cd -
```


# Token Swap Program
Full documentation is available at https://spl.solana.com/token-swap

Smart Contract is in the `./program` directory.
JavaScript bindings are available in the `./js` directory.

## Build

```sh
cd js; 
npm run build:program; 
cd -
```

## Deploy the smart contract

Need to have at least 5 SOL.

```sh
cd js; 
npm run deploy:program; 
cd -
```

## Create pools
To get wallet address run
```sh
solana address
```

## Create pools (devnet)
Provide Roman address and ask to send you coins
To confirm you have enough tokens run
```sh
spl-token accounts
```
To get SOL (Wrapped) run:
```sh
spl-token wrap 25
```

Create `js/.env` by running the following command

```sh
cd js;
npm run cluster:devnet;
cd -
```

### Devnet token address mapping:
- **SOLX**: 3Wm65cRmFAbiC52YXjw1dZkJLsYA75kvNFBdaZVjVQwD
- **USDC**: CB74zeEZk138FikM4W7b71eshsFttLq3LRFWqpAwXFXi
- **USDT**: CWgY911b1UszYmKiGYAoEbWrTNNgY1KuybJufzhsTxKx
- 
- **SOL(WRAP)**: So11111111111111111111111111111111111111112

### !!! IMPORTANT: make sure you prepared .env before every pool creation

Fullfill js/.env and run:
```sh
cd js; 
npm run create-pool; 
cd -
```

# MAINNET

Since beginning Soldex have 2 pools: SOLX/SOL, SOLX/USDC

### Mainnet token address mapping:
- **SOLX**: CH74tuRLTYcxG7qNJCsV9rghfLXJCQJbsu7i52a8F1Gn
- **USDC**: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
-
- **SOL(WRAP)**: So11111111111111111111111111111111111111112

### Set TOKEN_SWAP_PROGRAM_ID in and make sure your .env file is prepaed to create a pool:

*cluster-mainnet-beta-SOL.env*

*cluster-mainnet-beta-USDC.env*

## Create SOLX/SOL pool:

### Create .env file from *cluster-mainnet-beta-SOL.env*
```sh
cd js;
npm run cluster:mainnet-beta-SOL;
cd -
```

Once .env file is created correctly run the command to create a pool. Make sure you have the needed number of coins on your local address that would be added to the pool as initiated liquidity.

```sh
cd js; 
npm run create-pool; 
cd -
```

## Create SOLX/USDC pool:

### Create .env file from *cluster-mainnet-beta-USDC.env*
```sh
cd js;
npm run cluster:mainnet-beta-USDC;
cd -
```

Once new .env file is created correctly run the command to create a pool. Make sure you have the needed number of coins on your local address that would be added to the pool as initiated liquidity.

```sh
cd js; 
npm run create-pool; 
cd -
```

# Tests and local cluster
## The client connects to a local Solana cluster by default.

To enable on-chain program logs, set the RUST_LOG environment variable:

$ export RUST_LOG=solana_runtime::native_loader=trace,solana_runtime::system_instruction_processor=trace,solana_runtime::bank=debug,solana_bpf_loader=debug,solana_rbpf=debug

### Unit tests

Run unit tests from `./program/` using:

```sh
cargo test
```

### Fuzz tests

Using the Rust version of `honggfuzz`, we "fuzz" the Token Swap program every night.
Install `honggfuzz` with:

```sh
cargo install honggfuzz
```

From there, run fuzzing from `./program/fuzz` with:

```sh
cargo hfuzz run token-swap-instructions
```

If the program crashes or errors, `honggfuzz` dumps a `.fuzz` file in the workspace,
so you can debug the failing input using:

```sh
cargo hfuzz run-debug token-swap-instructions hfuzz_workspace/token-swap-instructions/*fuzz
```

This command attaches a debugger to the test, allowing you to easily see the
exact problem.

### Integration tests

You can test the JavaScript bindings and on-chain interactions using
`solana-test-validator`, included in the Solana Tool Suite.  See the
[CLI installation instructions](https://docs.solana.com/cli/install-solana-cli-tools).

From `./js`, install the required modules:

```sh
npm i
```

Then run all tests:

```sh
npm run start-with-test-validator
```

If you are testing a production build, use:

```sh
SWAP_PROGRAM_OWNER_FEE_ADDRESS="7uT58uvDWBSpJMRV5QwP5HiBGhFSjRkZWDza4EWiEQUM" npm run start-with-test-validator
```
