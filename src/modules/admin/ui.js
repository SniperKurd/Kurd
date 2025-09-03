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
  const tokenInput = byId('token');
  const testBtn = byId('testBtn');
  const msg = byId('msg');
  const debugEl = byId('debug');

  const cfg = getConfig();
  if (cfg.pair) pairInput.value = cfg.pair;
  if (cfg.rpc) rpcInput.value = cfg.rpc;
  if (cfg.router) routerInput.value = cfg.router;
  if (typeof cfg.slippageDefault === 'number') slippageInput.value = cfg.slippageDefault;

  testBtn.addEventListener('click', async () => {
    try {
      const rpc = rpcInput.value.trim();
      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const bn = await provider.getBlockNumber();
      msg.textContent = `اتصال ناجح. رقم البلوك: ${bn}`;
      msg.style.color = 'green';
    } catch (err) {
      msg.textContent = `فشل الاتصال: ${err.message}`;
      msg.style.color = 'red';
      if (debugEl) debugEl.textContent = err.stack || String(err);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let pair, router;
    try {
      pair = ethers.getAddress(pairInput.value.trim());
    } catch (err) {
      msg.textContent = 'عنوان الزوج غير صالح';
      msg.style.color = 'red';
      return;
    }
    try {
      router = ethers.getAddress(routerInput.value.trim());
    } catch (err) {
      msg.textContent = 'عنوان الراوتر غير صالح';
      msg.style.color = 'red';
      return;
    }

    const newCfg = {
      pair,
      rpc: rpcInput.value.trim(),
      router,
      slippageDefault: parseFloat(slippageInput.value) || 0,
    };

    try {
      const res = await fetch('./config/save-config.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenInput.value.trim()}`,
        },
        body: JSON.stringify(newCfg),
      });
      const text = await res.text();
      if (res.ok) {
        setConfig(newCfg);
        msg.textContent = 'تم الحفظ بنجاح';
        msg.style.color = 'green';
      } else {
        msg.textContent = `فشل الحفظ: ${text}`;
        msg.style.color = 'red';
      }
      if (debugEl) debugEl.textContent = text;
    } catch (err) {
      msg.textContent = `خطأ: ${err.message}`;
      msg.style.color = 'red';
      if (debugEl) debugEl.textContent = err.stack || String(err);
    }
  });
}

initAdmin();
