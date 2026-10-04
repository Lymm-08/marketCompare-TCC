document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('input[name="q"]');
  const searchForm = document.getElementById('search-form');
  const filterForm = document.getElementById('filter-form');
  const btnClear = document.getElementById('btn-clear');
  const productList = document.getElementById('product-list');
  const paginationNav = document.getElementById('pagination');

  if (!productList) return;

  const buildQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return query.toString();
  };

  const renderProducts = (products) => {
    if (!products || !products.length) {
      productList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">Nenhum produto encontrado.</div>
        </div>
      `;
      return;
    }

    productList.innerHTML = products
      .map((item) => {
        // Suporte a diferentes estruturas de objeto JSON (Inglês ou Português)
        const name = item.name || item.nome || 'Produto';
        const imageUrl = item.image_url || item.imagem_url || item.imagem || 'https://via.placeholder.com/300x200';
        const rawPrice = item.cheapest_price ?? item.preco_mais_barato ?? item.preco ?? 0;
        const formattedPrice = Number(rawPrice).toFixed(2).replace('.', ',');
        const cheapestOffer = (item.prices || []).reduce((best, offer) => {
          const offerPrice = Number(offer.price || offer.preco);
          return offerPrice < best.price ? { name: offer.market || offer.mercado, price: offerPrice } : best;
        }, { name: 'Mercado', price: Number.POSITIVE_INFINITY });
        const marketName = item.market || item.mercado || cheapestOffer.name;
        const id = item.id || '';

        return `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
            <div class="p-3 text-center bg-white">
              <img src="${imageUrl}" class="img-fluid" alt="${name}" style="height: 180px; object-fit: contain;">
            </div>
            <div class="card-body d-flex flex-column bg-white product-card__body">
              <h6 class="card-title fw-bold product-card__title mb-2">${name}</h6>
              <span class="product-card__market">${marketName}</span>
              <div class="mt-auto pt-2">
                <span class="text-muted small">A partir de</span>
                <div class="fs-5 fw-bold text-success">R$ ${formattedPrice}</div>
                <a href="/comparar/${id}" class="btn product-card__compare mt-2">Comparar preços</a>
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  };

  const renderPagination = (pagination, queryParams) => {
    if (!paginationNav) return;
    const { pages = 1, page = 1 } = pagination || {};

    if (pages <= 1) {
      paginationNav.style.display = 'none';
      return;
    }

    const pageItems = Array.from({ length: pages }, (_, index) => index + 1)
      .map((pageNum) => `
        <li class="page-item ${pageNum === page ? 'active' : ''}">
          <button class="page-link" type="button" data-page="${pageNum}">${pageNum}</button>
        </li>
      `)
      .join('');

    paginationNav.innerHTML = `
      <ul class="pagination justify-content-center">
        ${pageItems}
      </ul>
    `;
    paginationNav.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextPage = Number(button.dataset.page);
        const url = `?${buildQueryString({ ...queryParams, page: nextPage })}`;
        window.history.pushState({ page: nextPage }, '', url);
        loadPage(nextPage);
      });
    });
    paginationNav.style.display = '';
  };

  const getCurrentFilters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      q: searchInput ? searchInput.value.trim() : (urlParams.get('q') || ''),
      category: document.getElementById('category-select')?.value || urlParams.get('category') || '',
      market: document.getElementById('market-select')?.value || urlParams.get('market') || '',
      sort: document.getElementById('sort-select')?.value || urlParams.get('sort') || 'menor-preco',
    };
  };

  const loadPage = async (page = 1) => {
    const filters = getCurrentFilters();
    const queryString = buildQueryString({ ...filters, page });

    try {
      const response = await fetch(`/api/produtos?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      // Trata retorno caso seja um Array simples ou um Objeto com paginação
      const productsArray = Array.isArray(data) ? data : (data.products || data.produtos || []);
      const paginationData = data.pagination || { pages: 1, page: 1 };

      if (data.filters) populateFilters(data.filters);

      renderProducts(productsArray);
      renderPagination(paginationData, filters);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const populateFilters = ({ categories = [], markets = [] }) => {
    const categorySelect = document.getElementById('category-select');
    const marketSelect = document.getElementById('market-select');
    const selectedCategory = categorySelect?.value || new URLSearchParams(window.location.search).get('category') || '';
    const selectedMarket = marketSelect?.value || new URLSearchParams(window.location.search).get('market') || '';
    if (categorySelect) categorySelect.innerHTML = '<option value="">Todas as categorias</option>' + categories.map((value) => `<option value="${value}">${value}</option>`).join('');
    if (marketSelect) marketSelect.innerHTML = '<option value="">Todos os atacarejos</option>' + markets.map((value) => `<option value="${value}">${value}</option>`).join('');
    if (categorySelect) categorySelect.value = selectedCategory;
    if (marketSelect) marketSelect.value = selectedMarket;
  };

  // Eventos dos Formulários
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const filters = getCurrentFilters();
      window.history.pushState({ page: 1 }, '', `?${buildQueryString(filters)}`);
      loadPage(1);
    });
  }

  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const filters = getCurrentFilters();
      window.history.pushState({ page: 1 }, '', `?${buildQueryString(filters)}`);
      loadPage(1);
    });
  }

  window.addEventListener('popstate', () => {
    const page = Number(new URLSearchParams(window.location.search).get('page')) || 1;
    loadPage(page);
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (searchForm) searchForm.reset();
      if (filterForm) filterForm.reset();
      window.history.pushState({}, '', window.location.pathname);
      loadPage(1);
    });
  }

  // Carrega os produtos assim que a página é aberta
  loadPage(1);
});