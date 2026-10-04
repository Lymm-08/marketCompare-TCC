// Monta o shell lateral nas páginas internas, mantendo login e cadastro sem navegação.
window.MarketLayout = {
  init() {
    const authPage = document.body.classList.contains('auth-page') ||
      ['login-form', 'register-form', 'forgot-password-form'].some((id) => document.getElementById(id));
    const homePage = document.getElementById('product-list') || document.getElementById('sidebar');
    if (authPage || homePage) return;

    const content = Array.from(document.body.children).filter((element) => element.tagName !== 'SCRIPT');
    const shell = document.createElement('div');
    shell.className = 'app-shell';
    shell.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <a class="sidebar-brand" href="/"><span class="brand-badge">🛒</span><span class="brand-text">MarketCompare</span></a>
        <ul class="sidebar-nav" id="sidebar-nav"><li><a class="nav-link" href="/">Início</a></li></ul>
        <div class="sidebar-config"><div class="sidebar-config__label">Configuração</div>
          <div class="theme-switch" role="group" aria-label="Configurações do site">
            <button class="theme-switch__option is-active" type="button" data-theme="light">Claro</button>
            <button class="theme-switch__option" type="button" data-theme="dark">Escuro</button>
          </div>
        </div>
      </aside>
      <div class="content-area"><header class="topbar"><div class="topbar-left">
        <button class="sidebar-toggle" type="button" aria-label="Abrir menu">☰</button><span class="topbar-brand">MarketCompare</span>
      </div><div class="topbar-actions" id="topbar-actions"><a class="btn btn-outline-primary" href="/login">Entrar</a></div></header>
      <main class="inner-page-content"></main></div>`;

    document.body.prepend(shell);
    const target = shell.querySelector('.inner-page-content');
    content.forEach((element) => target.appendChild(element));
  }
};
