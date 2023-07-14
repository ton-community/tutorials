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

## Troubleshooting

### Connectivity issues

If you are experiencing connectivity issues while following the tutorials with errors such as

```bash
Error: exception in fetch(https://ton.access.orbs.network/mngr/nodes?npm_version=2.3.3): FetchError: request to https://ton.access.orbs.network/mngr/nodes?npm_version=2.3.3 failed, reason: read ECONNRESET
    at Nodes.
```

then we need to determine if you have access to the TON Access network.

Try the following command in your terminal:

```bash
curl https://ton.access.orbs.network
```

If you receive a HTML response, then you are able to access the TON Access network! Join [TON Access Support Group](https://t.me/TONAccessSupport) on Telegram if you still have connectivity issues.

If you received an error message from the `curl` command like this:

```bash
curl: (35) Recv failure: Connection was reset
```

Then your connection to the TON Access network is being blocked.

This could mean that your network/ISP is blocking access to the Orbs network. You can try to use a VPN to bypass this issue.

If you are using a VPN and still experiencing issues, then your VPN may not be routing all network traffic like your terminal or command line editor.

We would recommend using the following VPN software:

- Windscribe: <https://windscribe.com/>
- NordVPN: <https://nordvpn.com/>
- ExpressVPN: <https://www.expressvpn.com/>

Please contact us on the [TON Access Support Group](https://t.me/TONAccessSupport) on Telegram if you still have connectivity issues and share your error message with us.
