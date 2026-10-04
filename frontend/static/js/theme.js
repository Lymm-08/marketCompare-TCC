// Gerencia a preferência de tema em todas as páginas que possuem controles visuais.
window.MarketTheme = {
  init() {
    const buttons = document.querySelectorAll('.theme-switch__option, input[name="theme-options"]');
    const apply = (theme) => {
      document.body.classList.toggle('theme-dark', theme === 'dark');
      document.body.classList.toggle('theme-light', theme === 'light');
      localStorage.setItem('theme', theme);
      buttons.forEach((button) => {
        const buttonTheme = button.dataset.theme || (button.id === 'theme-dark' ? 'dark' : 'light');
        const active = buttonTheme === theme;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (button.matches('input')) button.checked = active;
      });
    };

    apply(localStorage.getItem('theme') || 'light');
    buttons.forEach((button) => {
      const selectTheme = () => apply(button.dataset.theme || (button.id === 'theme-dark' ? 'dark' : 'light'));
      button.addEventListener('change', selectTheme);
      button.addEventListener('click', () => {
        if (!button.matches('input')) selectTheme();
      });
    });
  }
};
