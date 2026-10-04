// Sincroniza sidebar, header e logout com a sessão mantida pelo backend.
window.MarketAuth = {
  async init() {
    const homeNav = document.getElementById('home-sidebar-nav');
    const homeActions = document.getElementById('home-header-actions');
    const nav = homeNav || document.getElementById('sidebar-nav');
    const actions = homeActions || document.getElementById('topbar-actions');
    if (!nav && !actions) return;

    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      if (data.authenticated) {
        localStorage.setItem('marketcompare-authenticated', 'true');
        nav.innerHTML = homeNav ? `
          <a href="/" class="nav-link active bg-light text-primary rounded-3 px-3 py-2 fw-semibold">Início</a>
          <a href="/favoritos" class="nav-link text-dark px-3 py-2">Meus favoritos</a>
          <a href="/meus-cadastros" class="nav-link text-dark px-3 py-2">Meus cadastros</a>
          <a href="/logout" class="nav-link text-dark px-3 py-2">Sair</a>` : `
          <li><a class="nav-link" href="/">Início</a></li><li><a class="nav-link" href="/favoritos">Meus favoritos</a></li>
          <li><a class="nav-link" href="/meus-cadastros">Meus cadastros</a></li><li><a class="nav-link" href="/logout">Sair</a></li>`;
        actions.innerHTML = '<a class="btn btn-outline-primary px-4" href="/logout">Sair</a>';
      } else {
        localStorage.removeItem('marketcompare-authenticated');
      }
    } catch (error) {
      console.error('Não foi possível carregar o estado de autenticação:', error);
    }
  }
};

document.addEventListener('click', async (event) => {
  const logoutLink = event.target.closest('a[href="/logout"]');
  if (!logoutLink) return;
  event.preventDefault();
  await fetch('/api/logout');
  localStorage.removeItem('marketcompare-authenticated');
  window.location.href = '/';
});
