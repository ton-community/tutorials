# Something not working with this tutorial?

We're sorry you're having a hard time! Let's fix this!

If something in the tutorial isn't working, these are the possible causes:

1. **You have a typo or a mistake somewhere in your code and you didn't follow the tutorial closely enough.**

    The bottom of every tutorial contains a link to the full code of all steps (in the *Conclusion* section). The code is written as an automated test that we run a few times a week. Compare your code to the test code and try to find where you did something different.

    A common mistake is trying to send transactions from a wallet contract that isn't deployed or funded. This can happen if you're setting the wrong wallet version. As explained in the first tutorial, check your wallet address in an explorer and if your wallet has a different version from "wallet v4 r2" you will need to modify the example code. Let's say for example that your version is "wallet v3 r2" and you're using [ton](https://www.npmjs.com/package/ton) library, then replace `WalletContractV4` with `WalletContractV3R2`.

2. **One of the libraries we depend on had a breaking change and the tutorial is out of date.**

    We try to make sure this doesn't happen by running the automated tests once a week. If we see that the tests stop passing, we know we need to fix something. If the automated test isn't passing, there's good chance this is what happened. See if any of the libraries changed recently and install the previous version.

3. **The tutorial has a mistake in it or is written in a confusing way.**

    This can happen, we are only human. Try to investigate the problem and suggest a change in the tutorial to make it more clear for the next person. The source code of the tutorials is available [here](https://github.com/ton-community/tutorials/) in the directories `01-wallet`, `02-contract`, etc. You can submit your proposal for an edit by submitting a [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests). Start by creating a [fork](https://github.com/ton-community/tutorials/fork) and then use GitHub's web UI to [open a new PR](https://github.com/ton-community/tutorials/pulls).

4. **You are experiencing connectivity issues.**

    If you are experiencing connectivity issues while following the tutorials with errors such as:

    ```bash
    Error: exception in fetch(https://ton.access.orbs.network/mngr/nodes?npm_version=2.3.3): FetchError: request to https://ton.access.orbs.network/mngr/nodes?npm_version=2.3.3 failed, reason: read ECONNRESET
        at Nodes.
    ```

    then we need to determine if you have access to the TON Access network.

    Try the following command in your terminal:

    ```bash
    curl https://ton.access.orbs.network
    ```

    If you receive a HTML response, then you are able to access the TON Access network! This means the issue is not a connectivity one.

    Otherwise, if you received an error message from the `curl` command like this:

    ```bash
    curl: (35) Recv failure: Connection was reset
    ```

    then your connection to the TON Access network is being blocked.

    This could mean a number of things. You may be living in a sanctioned country and your government or ISP is blocking access to the TON Access network. It could also be the network you are on could be restricting access.

    To get around this issue you can use a VPN and route your traffic through a different network.

    If you are already using a VPN and still experiencing issues, then your VPN software may not be routing all network traffic like your terminal or command line editor.

    We would recommend using the following VPN software:

    - NordVPN: <https://nordvpn.com/>
    - ExpressVPN: <https://www.expressvpn.com/>
    - Nekoray: <https://github.com/MatsuriDayo/nekoray>
    - Windscribe: <https://windscribe.com/>


If you're really stuck, contact us in the following community channels:

* Submit a question in https://answers.ton.org (a StackOverflow clone dedicated to TON)
* Open an issue on the tutorials repo https://github.com/ton-community/tutorials/issues
* Come chat with us on Telegram in https://t.me/tondev_eng