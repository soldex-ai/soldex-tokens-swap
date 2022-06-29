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
cd js; npm install; cd -
```


# Token Swap Program
Full documentation is available at https://spl.solana.com/token-swap

Smart Contract is in the `./program` directory.
JavaScript bindings are available in the `./js` directory.

## Build

```sh
cd js; npm run build:program; cd -
```

## Deploy the smart contract

Need to have at least 4 SOL.

```sh
cd js; npm run deploy:program; cd -
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
cd js; npm run cluster:devnet; cd -
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
cd js; npm run create-pool; cd -
```
