# Simple Wallet Demo

This repository contains a minimal example of a cryptocurrency wallet using Python. The script `wallet.py` demonstrates how to:

- Generate a 12-word mnemonic phrase (BIP39)
- Derive an Ethereum address from the mnemonic
- Check the account balance
- Send Ether to another address

The implementation relies on `web3.py` and `eth-account`. To use it, install dependencies:

```bash
pip install web3 eth-account mnemonic qrcode pillow
```

Then run:

```bash
PROVIDER_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID python wallet.py
```

This connects to an Ethereum HTTP provider (e.g. Infura) to access the network. Replace
`YOUR-PROJECT-ID` with your service key or use another provider.

This example is for educational purposes and does not include advanced security or management features found in production wallets like Trust Wallet. Use at your own risk.

## Graphical Interface

`gui.py` provides a simple Tkinter GUI that lets you:

- Create or recover a wallet from a 12-word phrase
- Copy the wallet address to the clipboard
- Display a QR code for receiving funds
- Check the balance and send Ether

Run it with the same provider environment variable:

```bash
PROVIDER_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID python gui.py
```
