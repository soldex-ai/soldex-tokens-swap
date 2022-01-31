# set the solana config 
you can set your current environment to devnetor testnet. This is the test network for Solana developers writing and testing smart contracts.
$ solana config set --url https://api.testnet.solana.com (for testnet)
$ solana config set --url https://api.devnet.solana.com (for devnet)
# Next, you need to create a new keypair for your account. This is required to interact with deployed programs (smart contracts) on the Solana devnet.

 $ solana-keygen new --force

#Now that you’ve created an account, you can use the airdrop program to obtain some SOL tokens. 
You will need some lamports (fractions of SOL tokens) to deploy your smart contract. This command requests SOL tokens into your newly generated account: 

$ solana airdrop 5 


## Building

To build a development version of the Token Swap program, you can use the normal
build command for Solana programs:build the rust token swap smart contract.......
```sh
$ cargo build-bpf
```
//For production versions, the Token Swap Program contains a `production` feature
//to fix constraints on fees and fee account owner. A developer can
//deploy the program, allow others to create pools, and earn a "protocol fee" on
//all activity.

## Deploy the smart contract 

solana program deploy <PATH of FILE>/spl_token_swap.so

You can build the production version of Token Swap running on devnet, testnet, and
mainnet-beta using the following command:
# Token Swap Program

A Uniswap-like exchange for the Token program on the Solana blockchain, deployed
to `TOKEN_SWAP_PROGRAM_ID :35J9s72PQRsHKf7bnsBfQnHYxkchLAaQmN9Bc1x7vS7w` on all networks.


//SWAP_PROGRAM_OWNER_FEE_ADDRESS=Hp8wqzZZmmbUunm3Y7CXxZ8qK3iVWSUNSPgfwkgNrtyC(wallet address ) 

//Full documentation is available at https://spl.solana.com/token-swap


## The client connects to a local Solana cluster by default.

To enable on-chain program logs, set the RUST_LOG environment variable:

$ export RUST_LOG=solana_runtime::native_loader=trace,solana_runtime::system_instruction_processor=trace,solana_runtime::bank=debug,solana_bpf_loader=debug,solana_rbpf=debug


## Build the on-chain program

$ npm run build:program

## set cluster 

npm run cluster:devnet / npm run cluster:localnet / npm run cluster:testnet(command to set cluster network)

## Run the test client
$ npm run test (to run the token swap script)

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
SWAP_PROGRAM_OWNER_FEE_ADDRESS="Hp8wqzZZmmbUunm3Y7CXxZ8qK3iVWSUNSPgfwkgNrtyC" npm run start-with-test-validator
```
