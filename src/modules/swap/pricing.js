/**
 * Fetches pair and token data to compute pricing info.
 */
import { formatPrice } from '../core/format.js';

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

export async function loadPairInfo(config, provider) {
  const pair = new ethers.Contract(config.pair, pairAbi, provider);
  const [t0, t1] = await Promise.all([pair.token0(), pair.token1()]);
  const token0 = new ethers.Contract(t0, erc20Abi, provider);
  const token1 = new ethers.Contract(t1, erc20Abi, provider);
  const [name0, sym0, d0, name1, sym1, d1, reserves] = await Promise.all([
    token0.name(), token0.symbol(), token0.decimals(),
    token1.name(), token1.symbol(), token1.decimals(),
    pair.getReserves()
  ]);
  const reserve0 = Number(reserves.reserve0) / 10 ** d0;
  const reserve1 = Number(reserves.reserve1) / 10 ** d1;
  const price = reserve1 && reserve0 ? formatPrice(reserve1 / reserve0) : 'N/A';

  return {
    token0: { address: t0, name: name0, symbol: sym0, decimals: d0 },
    token1: { address: t1, name: name1, symbol: sym1, decimals: d1 },
    price
  };
}
