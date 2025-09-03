# Token Swap Skeleton

This project provides a minimal front‑end for swapping a single token pair on PancakeSwap. It now includes a simple admin page for configuring the pair and router addresses.

## Setup

1. Open `admin.html` and enter the pair address, router address and optional RPC/slippage values. The configuration is stored in the browser's `localStorage`.
2. Serve the files through a static web server (no backend required).
3. Open `index.html` to access the swap interface.

## Usage

- The swap page displays pair information and allows the user to enter an amount and slippage percentage.
- When the swap button is pressed the script requests wallet access, approves the input token and sends a `swapExactTokensForTokens` transaction via the configured router.
- If the transaction fails due to low slippage a hint to increase it is shown.

## Development

- `libs/ethers.umd.min.js` contains the Ethers.js library to interact with BSC.
- `assets/js/admin.js` handles saving admin configuration to `localStorage`.
- `assets/js/app.js` reads the configuration, fetches token metadata and performs swaps.
- `assets/js/revert-diagnoser.js` is a placeholder for future revert diagnostics.

## Testing

Run:

```bash
npm test
```

Currently there are no automated tests; this command will output a placeholder message.
