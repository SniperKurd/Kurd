(function () {
  const form = document.getElementById('configForm');
  const pairInput = document.getElementById('pair');
  const rpcInput = document.getElementById('rpc');
  const routerInput = document.getElementById('router');
  const slippageInput = document.getElementById('slippage');

  const stored = localStorage.getItem('AdminSwapConfig');
  if (stored) {
    try {
      const cfg = JSON.parse(stored);
      if (cfg.pair) pairInput.value = cfg.pair;
      if (cfg.rpc) rpcInput.value = cfg.rpc;
      if (cfg.router) routerInput.value = cfg.router;
      if (typeof cfg.slippageDefault === 'number') slippageInput.value = cfg.slippageDefault;
    } catch (e) {
      console.warn('Failed to parse stored config');
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const cfg = {
      pair: pairInput.value.trim(),
      rpc: rpcInput.value.trim(),
      router: routerInput.value.trim(),
      slippageDefault: parseFloat(slippageInput.value) || 0,
    };
    localStorage.setItem('AdminSwapConfig', JSON.stringify(cfg));
    alert('Configuration saved');
  });
})();
