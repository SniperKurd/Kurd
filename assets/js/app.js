(async function () {
  const stored = localStorage.getItem('AdminSwapConfig');
  const config = Object.assign({}, stored ? JSON.parse(stored) : {}, window.AdminSwapConfig);
  if (!config.pair || !config.router) {
    document.getElementById('pairInfo').textContent = 'Configuration missing pair or router address.';
    return;
  }

  const rpcUrl = config.rpc || 'https://bsc-dataseed.binance.org/';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const pairAbi = [
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
  ];
  const erc20Abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)'
  ];
  const routerAbi = [
    'function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)'
  ];

  let t0, t1, dec0, dec1;
  try {
    const pair = new ethers.Contract(config.pair, pairAbi, provider);
    [t0, t1] = await Promise.all([pair.token0(), pair.token1()]);
    const token0 = new ethers.Contract(t0, erc20Abi, provider);
    const token1 = new ethers.Contract(t1, erc20Abi, provider);
    const [name0, sym0, d0, name1, sym1, d1] = await Promise.all([
      token0.name(), token0.symbol(), token0.decimals(),
      token1.name(), token1.symbol(), token1.decimals()
    ]);
    dec0 = d0; dec1 = d1;
    document.getElementById('pairInfo').textContent = `${name0} (${sym0}) / ${name1} (${sym1})`;
  } catch (err) {
    document.getElementById('pairInfo').textContent = 'Failed to load pair info';
    console.error('Failed to load pair info', err);
    return;
  }

  document.getElementById('swapBtn').addEventListener('click', async function () {
    const amountStr = document.getElementById('amount').value.trim();
    const slip = parseFloat(document.getElementById('slippage').value);
    if (!amountStr) {
      document.getElementById('message').textContent = 'Enter amount.';
      return;
    }
    if (isNaN(slip)) {
      document.getElementById('message').textContent = 'Enter slippage.';
      return;
    }
    if (!window.ethereum) {
      document.getElementById('message').textContent = 'No wallet found.';
      return;
    }
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      const signer = await browserProvider.getSigner();
      const router = new ethers.Contract(config.router, routerAbi, signer);
      const path = [t0, t1];
      const amountIn = ethers.parseUnits(amountStr, dec0);
      const amounts = await router.getAmountsOut(amountIn, path);
      const amountOut = amounts[1];
      const minOut = amountOut - (amountOut * BigInt(Math.floor(slip * 100)) / 10000n);
      const token0 = new ethers.Contract(t0, ['function approve(address,uint256)'], signer);
      await token0.approve(config.router, amountIn);
      const tx = await router.swapExactTokensForTokens(
        amountIn,
        minOut,
        path,
        await signer.getAddress(),
        Math.floor(Date.now() / 1000) + 60 * 10
      );
      document.getElementById('message').textContent = `Swap submitted: ${tx.hash}`;
    } catch (err) {
      console.error(err);
      let msg = err.message || 'Swap failed';
      if (msg.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
        msg += '. Try increasing slippage.';
      }
      document.getElementById('message').textContent = msg;
    }
  });
})();
