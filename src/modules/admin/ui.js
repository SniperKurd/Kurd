/**
 * UI handlers for the admin configuration page.
 */
import { byId } from '../core/dom.js';
import { getConfig, setConfig } from './api.js';

export function initAdmin() {
  const form = byId('configForm');
  const pairInput = byId('pair');
  const rpcInput = byId('rpc');
  const routerInput = byId('router');
  const slippageInput = byId('slippage');

  const cfg = getConfig();
  if (cfg.pair) pairInput.value = cfg.pair;
  if (cfg.rpc) rpcInput.value = cfg.rpc;
  if (cfg.router) routerInput.value = cfg.router;
  if (typeof cfg.slippageDefault === 'number') slippageInput.value = cfg.slippageDefault;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCfg = {
      pair: pairInput.value.trim(),
      rpc: rpcInput.value.trim(),
      router: routerInput.value.trim(),
      slippageDefault: parseFloat(slippageInput.value) || 0,
    };
    setConfig(newCfg);
    alert('Configuration saved');
  });
}

initAdmin();
