# Token Swap Skeleton

This project provides a minimal front‑end for swapping a single token pair on PancakeSwap. It includes a basic design with a centered container and form controls, plus an admin page for configuring the pair and router addresses.

## Setup

1. Copy `.env.example` to `.env` and adjust values if needed (optional; used when adding backend endpoints).
2. Install dependencies and start a local web server:

   ```bash
   npm run setup
   npm run start
   ```

   This uses `http-server` to serve the files on <http://localhost:8080>.
3. Open `admin.html` and enter the pair address, router address and optional RPC/slippage values. The configuration is stored in the browser's `localStorage`.
4. Open `index.html` to access the swap interface.

## Usage

- The swap page displays pair information, including token names and the current price derived from reserves.
- Users can enter an amount and slippage percentage before initiating a swap. An optional **Swap with no slippage limit** checkbox allows forcing the swap with a minimum received amount of `0`.
- When the swap button is pressed the script requests wallet access, approves the input token and sends a `swapExactTokensForTokens` transaction via the configured router.
- If the transaction fails due to low slippage a hint to increase it is shown.

## Development

- `libs/ethers.umd.min.js` contains the Ethers.js library to interact with BSC.
- `assets/js/admin.js` handles saving admin configuration to `localStorage`.
- `assets/js/app.js` reads the configuration, fetches token metadata, calculates price data and performs swaps.
- `assets/js/revert-diagnoser.js` is a placeholder for future revert diagnostics.

## Testing

Run:

```bash
npm test
```

Currently there are no automated tests; this command will output a placeholder message.
