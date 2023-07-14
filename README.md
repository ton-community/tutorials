# TON Tutorials

### [01. Working with your first wallet](https://ton-community.github.io/tutorials/01-wallet)
>
> Create a wallet, fund it, initialize it, see in explorer, read/write to it with code

[![01-wallet-npmton](https://github.com/ton-community/tutorials/actions/workflows/01-wallet-npmton.yml/badge.svg)](https://github.com/ton-community/tutorials/actions/workflows/01-wallet-npmton.yml) [![01-wallet-tonweb](https://github.com/ton-community/tutorials/actions/workflows/01-wallet-tonweb.yml/badge.svg)](https://github.com/ton-community/tutorials/actions/workflows/01-wallet-tonweb.yml)

### [02. Writing your first smart contract](https://ton-community.github.io/tutorials/02-contract)
>
> Create a simple counter smart contract, build and deploy it, read/write to it with code

[![02-contract](https://github.com/ton-community/tutorials/actions/workflows/02-contract.yml/badge.svg)](https://github.com/ton-community/tutorials/actions/workflows/02-contract.yml)

### [03. Building your first web client](https://ton-community.github.io/tutorials/03-client)
>
> Create a simple client (TWA+web) that interacts with the counter smart contract

[![03-client](https://github.com/ton-community/tutorials/actions/workflows/03-client.yml/badge.svg)](https://github.com/ton-community/tutorials/actions/workflows/03-client.yml)

### [04. Testing your first smart contract](https://ton-community.github.io/tutorials/04-testing)
>
> Create a test suite for the counter smart contract to make sure it works as expected

[![04-testing](https://github.com/ton-community/tutorials/actions/workflows/04-testing.yml/badge.svg)](https://github.com/ton-community/tutorials/actions/workflows/04-testing.yml)

&nbsp;

## The Tutorial System

### Design goals

- A concise list of tutorials that help new TON developers onboard
- Allow multiple community contributors to help maintain the tutorials
- Support multiple development flavors, tools and styles side by side
- Know when tutorials break (for example due to library changes) and need fixing

### Build the tutorials

- Create the file `.env` in the project root with this content:

  ```bash
  MNEMONIC="unfold sugar water ..."
  ```

  > The official mnemonic appears in Github repo secrets since it's also used in CI. This should be the 24 word mnemonic for a deployed testnet v4 wallet that contains at least 1 TON.
- Run `./build.sh`
- Resulting files will be created in the `docs/` directory, ready for Github Pages
