/**
 * Initializes swap interactions and handles user swaps.
 */
import { byId } from '../core/dom.js';
import { parseJSON } from '../core/utils.js';
import { loadPairInfo } from './pricing.js';
import { minOutput } from './slippage.js';
import { diagnose } from '../diagnoser/revert.js';

export async function initSwap() {
  const stored = localStorage.getItem('AdminSwapConfig');
  const config = Object.assign({}, parseJSON(stored), window.AdminSwapConfig);
  if (!config.pair || !config.router) {
    byId('pairInfo').textContent = 'Configuration missing pair or router address.';
    return;
  }

  const rpcUrl = config.rpc || 'https://bsc-dataseed.binance.org/';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  let token0, token1;
  try {
    const info = await loadPairInfo(config, provider);
    token0 = info.token0;
    token1 = info.token1;
    byId('pairInfo').innerHTML = `<strong>${info.token0.name} (${info.token0.symbol}) / ${info.token1.name} (${info.token1.symbol})</strong><br>Price: 1 ${info.token0.symbol} = ${info.price} ${info.token1.symbol}`;
  } catch (err) {
    byId('pairInfo').textContent = 'Failed to load pair info';
    console.error('Failed to load pair info', err);
    return;
  }

  byId('swapBtn').addEventListener('click', async () => {
    const amountStr = byId('amount').value.trim();
    const slip = parseFloat(byId('slippage').value);
    const forceSwap = byId('forceSwap').checked;
    if (!amountStr) {
      byId('message').textContent = 'Enter amount.';
      return;
    }
    if (!forceSwap && isNaN(slip)) {
      byId('message').textContent = 'Enter slippage.';
      return;
    }
    if (!window.ethereum) {
      byId('message').textContent = 'No wallet found.';
      return;
    }
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      const signer = await browserProvider.getSigner();
      const routerAbi = [
        'function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)'
      ];
      const router = new ethers.Contract(config.router, routerAbi, signer);
      const path = [token0.address, token1.address];
      const amountIn = ethers.parseUnits(amountStr, token0.decimals);
      const amounts = await router.getAmountsOut(amountIn, path);
      const amountOut = amounts[1];
      const minOut = minOutput(amountOut, slip, forceSwap);
      const token0Contract = new ethers.Contract(token0.address, ['function approve(address,uint256)'], signer);
      await token0Contract.approve(config.router, amountIn);
      const tx = await router.swapExactTokensForTokens(
        amountIn,
        minOut,
        path,
        await signer.getAddress(),
        Math.floor(Date.now() / 1000) + 60 * 10
      );
      byId('message').textContent = `Swap submitted: ${tx.hash}`;
    } catch (err) {
      console.error(err);
      byId('message').textContent = diagnose(err);
    }
  });
}

initSwap();
