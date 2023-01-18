# TON Tutorials

### 01 - wallet
> Create a wallet, fund it, initialize it, see in explorer, read/write to it with code

### 02 - contract
> Create a simple counter smart contract, build and deploy it, read/write to it with code

### 03 - client
> Create a simple client (TWA+web) that interacts with the counter smart contract

### 04 - tests
> Create a test suite for the counter smart contract to make sure it works as expected

&nbsp;

## The Tutorial System

### Design goals

- A concise list of tutorials that help new TON developers onboard
- Allow multiple community contributors to help maintain the tutorials
- Support multiple development flavors, tools and styles side by side
- Know when tutorials break (for example due to library changes) and need fixing

### Build the tutorials

- Create the file `.env` in the project root with this content:
  ```
  MNEMONIC="unfold sugar water ..."
  ```
  > The official mnemonic appears in Github repo secrets
- Run `npm run build`
- Resulting files will be created in the `docs/` directory