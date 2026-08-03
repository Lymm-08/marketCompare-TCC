document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('input[name="q"]');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarToggles = document.querySelectorAll('.sidebar-toggle');
  const themeButtons = document.querySelectorAll('.theme-switch__option');
  const overlay = document.createElement('div');

  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  // Apply and persist the selected theme (light or dark).
  const applyTheme = (theme) => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('theme', theme);

    themeButtons.forEach((button) => {
      const active = button.dataset.theme === theme;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  const productList = document.getElementById('product-list');
  const paginationNav = document.getElementById('pagination');

  // Build a URL query string from an object of filter parameters.
  const buildQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return query.toString();
  };

  // Render product cards returned from the backend API.
  const renderProducts = (products) => {
    if (!productList) return;

    if (!products.length) {
      productList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">Nenhum produto encontrado.</div>
        </div>
      `;
      return;
    }

    productList.innerHTML = products
      .map((item) => {
        const cheapestPrice = Number.isFinite(Number(item.cheapest_price))
          ? Number(item.cheapest_price).toFixed(2)
          : '0.00';

        return `
        <div class="col-md-6 col-xl-4 product-card">
          <div class="card h-100 shadow-sm">
            <img src="${item.image_url || 'https://via.placeholder.com/300x180'}" class="card-img-top" alt="${item.name}" />
            <div class="card-body">
              <span class="badge text-bg-light mb-2">${item.category}</span>
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text text-muted">${item.brand}</p>
              <p class="fw-bold text-success">Menor preço: R$ ${cheapestPrice}</p>
              <a href="/comparar/${item.id}" class="btn btn-primary">Comparar preços</a>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  };

  // Render pagination controls under the product list.
  const renderPagination = (pagination, queryParams) => {
    if (!paginationNav) return;
    const { pages, page } = pagination;

    if (pages <= 1) {
      paginationNav.style.display = 'none';
      return;
    }

    const pageItems = Array.from({ length: pages }, (_, index) => index + 1)
      .map((pageNum) => `
        <li class="page-item ${pageNum === page ? 'active' : ''}">
          <a class="page-link" href="?${buildQueryString({ ...queryParams, page: pageNum })}">${pageNum}</a>
        </li>
      `)
      .join('');

    paginationNav.innerHTML = `
      <ul class="pagination justify-content-center">
        ${pageItems}
      </ul>
    `;
    paginationNav.style.display = '';
  };

  // Read current filter values from the page URL.
  const getCurrentFilters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      q: urlParams.get('q') || '',
      category: urlParams.get('category') || '',
      market: urlParams.get('market') || '',
      sort: urlParams.get('sort') || 'menor-preco',
    };
  };

  // Load a specific results page with the current filters and update the UI.
  const loadPage = async (page) => {
    const filters = getCurrentFilters();
    const queryString = buildQueryString({ ...filters, page });

    try {
      const response = await fetch(`/api/produtos?${queryString}`);
      const data = await response.json();
      renderProducts(data.products);
      renderPagination(data.pagination, filters);
      window.history.pushState({ page }, '', `?${queryString}`);
    } catch (error) {
      console.error('Erro ao carregar página:', error);
    }
  };

  if (paginationNav) {
    paginationNav.addEventListener('click', (event) => {
      const link = event.target.closest('a.page-link');
      if (link) {
        event.preventDefault();
        const url = new URL(link.href, window.location.origin);
        const page = Number(url.searchParams.get('page') || 1);
        loadPage(page);
      }
    });
  }

  window.addEventListener('popstate', () => {
    const page = Number(new URLSearchParams(window.location.search).get('page') || 1);
    loadPage(page);
  });

  if (searchInput) {
    searchInput.addEventListener('input', async (event) => {
      const query = event.target.value.trim();
      if (query.length < 2) return;
      try {
        const response = await fetch(`/api/produtos?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        renderProducts(data.products);
        renderPagination(data.pagination, { q: query, category: '', market: '', sort: 'menor-preco' });
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    });
  }

  const closeSidebar = () => {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  };

  sidebarToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('is-open');
      overlay.classList.toggle('is-visible', isOpen);
    });
  });

  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('click', (event) => {
    // guard against missing elements
    if (sidebar && sidebarToggle) {
      if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
        closeSidebar();
      }
    }
  });

  const convertActionLinksToButtons = () => {
    const selectors = [
      'a.btn',
      '.sidebar-nav a',
      '.topbar-actions a',
      'a.floating-add-btn',
    ].join(', ');
    document.querySelectorAll(selectors).forEach((anchor) => {
      if (!anchor.href) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = anchor.className;
      button.id = anchor.id || '';
      button.setAttribute('aria-label', anchor.getAttribute('aria-label') || '');
      button.innerHTML = anchor.innerHTML;
      button.addEventListener('click', () => {
        window.location.href = anchor.href;
      });
      anchor.replaceWith(button);
    });
  };

  convertActionLinksToButtons();

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyTheme(button.dataset.theme);
    });
  });

  // Auto-dismiss flash messages placed in the flash container faster
  const flashAlerts = document.querySelectorAll('#flash-container .alert, .flash-card .alert');
  flashAlerts.forEach((alert) => {
    const card = alert.closest('.flash-card');
    const removeAlert = () => {
      alert.classList.add('fade-out');
      setTimeout(() => {
        alert.remove();
        if (card && card.querySelectorAll('.alert').length === 0) {
          card.classList.add('fade-out');
          setTimeout(() => card.remove(), 300);
        }
      }, 300);
    };

    setTimeout(removeAlert, 1200);
    alert.addEventListener('click', removeAlert);
  });
});
