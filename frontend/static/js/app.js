// Ponto único de inicialização dos comportamentos globais do frontend.
const APP_MODULES = [
  '/static/js/theme.js',
  '/static/js/layout.js',
  '/static/js/sidebar.js',
  '/static/js/auth-ui.js'
];

function loadModule(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(script);
  });
}

async function initializeApp() {
  await Promise.all(APP_MODULES.map(loadModule));
  MarketLayout.init();
  MarketTheme.init();
  MarketSidebar.init();
  MarketAuth.init();
  initializeFlashAlerts();
}

function initializeFlashAlerts() {
  document.querySelectorAll('#flash-container .alert, .flash-card .alert').forEach((alert) => {
    const card = alert.closest('.flash-card');
    const remove = () => {
      alert.classList.add('fade-out');
      setTimeout(() => {
        alert.remove();
        if (card && !card.querySelector('.alert')) card.remove();
      }, 300);
    };
    setTimeout(remove, 2500);
    alert.addEventListener('click', remove);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp().catch((error) => console.error('Falha ao inicializar a interface:', error));
});
