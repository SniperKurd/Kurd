/**
 * Initializes swap interactions and handles user swaps.
 */
import { byId } from '../core/dom.js';
import { parseJSON } from '../core/utils.js';
import { loadPairInfo } from './pricing.js';
import { minOutput, priceImpact } from './slippage.js';
import { diagnose } from '../diagnoser/revert.js';

async function selectProvider(cfg) {
  const primary = cfg.rpc || 'https://bsc-dataseed.binance.org/';
  const fallback = cfg.rpcFallback || cfg.rpcFallbackUrl;
  const timeout = 5000;
  try {
    const provider = new ethers.JsonRpcProvider(primary);
    await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);
    return provider;
  } catch (err) {
    if (fallback) {
      console.warn('Primary RPC failed, switching to fallback');
      const fb = new ethers.JsonRpcProvider(fallback);
      return fb;
    }
    throw err;
  }
}

export async function initSwap() {
  const stored = localStorage.getItem('AdminSwapConfig');
  const config = Object.assign({}, parseJSON(stored), window.AdminSwapConfig);
  if (!config.pair || !config.router) {
    byId('pairInfo').textContent = 'Configuration missing pair or router address.';
    return;
  }

  let provider;
  try {
    provider = await selectProvider(config);
  } catch (err) {
    byId('pairInfo').textContent = 'فشل الاتصال بالـRPC';
    console.error('RPC connection failed', err);
    return;
  }

  let token0, token1;
  try {
    const info = await loadPairInfo(config, provider);
    token0 = info.token0;
    token1 = info.token1;
    byId('pairInfo').innerHTML = `<strong>${info.token0.name} (${info.token0.symbol}) / ${info.token1.name} (${info.token1.symbol})</strong><br>Price: 1 ${info.token0.symbol} = ${info.price} ${info.token1.symbol}`;
    token0.reserve = info.reserve0; token1.reserve = info.reserve1; token0.priceNum = info.priceNum;
  } catch (err) {
    byId('pairInfo').textContent = 'Failed to load pair info';
    console.error('Failed to load pair info', err);
    return;
  }

  const msgEl = byId('message');
  const debugEl = byId('debug');

  byId('swapBtn').addEventListener('click', async () => {
    const amountStr = byId('amount').value.trim();
    const slip = parseFloat(byId('slippage').value);
    const forceSwap = byId('forceSwap').checked;
    if (!amountStr) {
      msgEl.textContent = 'أدخل الكمية.';
      return;
    }
    if (!forceSwap && isNaN(slip)) {
      msgEl.textContent = 'أدخل الانزلاق.';
      return;
    }
    if (!window.ethereum) {
      msgEl.textContent = 'المحفظة غير متوفرة.';
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
      const amountInNum = Number(ethers.formatUnits(amountIn, token0.decimals));
      const amountOutNum = Number(ethers.formatUnits(amountOut, token1.decimals));
      const impact = priceImpact(amountInNum, amountOutNum, token0.priceNum);
      if (impact > 10) {
        msgEl.textContent = `تحذير: تأثير سعري مرتفع (${impact.toFixed(2)}%)`;
      } else {
        const minFmt = ethers.formatUnits(minOut, token1.decimals);
        msgEl.textContent = `الحد الأدنى المستلم: ${minFmt}`;
      }

      const token0Contract = new ethers.Contract(token0.address, ['function approve(address,uint256)'], signer);
      await token0Contract.approve(config.router, amountIn);

      try {
        await router.estimateGas.swapExactTokensForTokens(
          amountIn,
          minOut,
          path,
          await signer.getAddress(),
          Math.floor(Date.now() / 1000) + 60 * 10
        );
      } catch (gasErr) {
        const d = diagnose(gasErr);
        msgEl.textContent = d.user;
        if (debugEl) debugEl.textContent = d.debug;
        return;
      }

      const tx = await router.swapExactTokensForTokens(
        amountIn,
        minOut,
        path,
        await signer.getAddress(),
        Math.floor(Date.now() / 1000) + 60 * 10
      );
      msgEl.textContent = `تم إرسال السواب: ${tx.hash}`;
    } catch (err) {
      const d = diagnose(err);
      console.error(err);
      msgEl.textContent = d.user;
      if (debugEl) debugEl.textContent = d.debug;
    }
  });
}

initSwap();
