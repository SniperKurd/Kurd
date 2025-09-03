# Token Swap Skeleton

This project provides a minimal front-end for swapping a single token pair on PancakeSwap. It includes a basic design with a centered container and form controls, plus an admin page for configuring the pair and router addresses.

## Setup

1. Copy `.env.example` to `.env` and adjust values if needed (optional; used when adding backend endpoints).
2. Install dependencies and start a local web server:

   ```bash
   npm run setup
   npm run start
This uses http-server to serve the files on http://localhost:8080.
3. Open admin.html and enter the pair address, router address, optional RPC/slippage values and admin token. You can test the RPC connection via "اختبار الاتصال" which reads the latest block number. Saving sends the configuration to config/save-config.php with a Bearer token and persists it locally on success.
4. Open index.html to access the swap interface.

Usage
The swap page displays pair information, including token names and the current price derived from reserves.

Users can enter an amount and slippage percentage before initiating a swap. An optional Swap with no slippage limit checkbox allows forcing the swap with a minimum received amount of 0.

When the swap button is pressed the script requests wallet access, approves the input token and sends a swapExactTokensForTokens transaction via the configured router.

If the transaction fails due to low slippage a hint to increase it is shown.

Development
libs/ethers.umd.min.js contains the Ethers.js library to interact with BSC.

src/modules/admin/* contains the admin UI logic and local storage helpers.

src/modules/swap/* reads configuration, fetches token metadata, calculates price data and performs swaps.

src/modules/diagnoser/revert.js is a placeholder for future revert diagnostics.

Testing
Run:

bash
نسخ الكود
npm test
This runs Playwright end-to-end tests that open the swap and admin pages, verifying basic UI elements and mocking RPC calls.

markdown
نسخ الكود

لو جاهز، بعدها اضغط **Commit merge** ثم ارجع لتبويب **Conversation** واضغط **Merge pull request**.
::contentReference[oaicite:0]{index=0}