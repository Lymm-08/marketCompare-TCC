// Mantém a sidebar fechada e controla sua abertura lateral sem sobrepor o conteúdo.
window.MarketSidebar = {
  init() {
    const sidebar = document.getElementById('sidebar');
    const toggles = document.querySelectorAll('.sidebar-toggle');
    if (!sidebar || !toggles.length) return;

    const close = () => {
      sidebar.classList.remove('is-open');
      document.querySelector('.app-shell')?.classList.remove('sidebar-open');
    };

    toggles.forEach((button) => button.addEventListener('click', () => {
      const open = sidebar.classList.toggle('is-open');
      document.querySelector('.app-shell')?.classList.toggle('sidebar-open', open);
    }));

    document.addEventListener('click', (event) => {
      if (!sidebar.contains(event.target) && !event.target.closest('.sidebar-toggle')) close();
    });
  }
};
