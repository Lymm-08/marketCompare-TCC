const path = require('path');
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const fs = require('fs');

// Cria a aplicação principal do servidor Express.
const app = express();
// Define a porta em que o servidor vai rodar, usando a variável de ambiente ou a porta 5000 por padrão.
const PORT = process.env.PORT || 5000;
// Define os caminhos para a pasta frontend, arquivos estáticos e templates.
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const STATIC_DIR = path.join(FRONTEND_DIR, 'static');
const TEMPLATES_DIR = path.join(FRONTEND_DIR, 'templates');
// Caminho do arquivo JSON que contém os produtos mockados.
const PRODUCTS_FILE = path.join(__dirname, '..', 'mock_data', 'products.json');

// Habilita o tratamento de formulários enviados via URL encoded e JSON.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve os arquivos estáticos do frontend e as imagens dos produtos.
app.use('/static', express.static(STATIC_DIR));
app.use('/image', express.static(path.join(STATIC_DIR, 'js', 'image')));

// Configura a sessão do usuário para páginas futuras que precisem de autenticação.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'marketcompare-node-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Configura o mecanismo de templates Nunjucks para renderizar as páginas HTML do frontend.
const env = nunjucks.configure(TEMPLATES_DIR, {
  autoescape: true,
  express: app,
  watch: false,
});

// Adiciona um filtro reutilizável para formatar valores numéricos nas páginas HTML.
env.addFilter('format', (value, arg) => {
  let numberValue = value;
  let formatString = arg;

  if (typeof value === 'string' && typeof arg === 'number') {
    formatString = value;
    numberValue = arg;
  }

  if (typeof formatString === 'string' && formatString.startsWith('%.') && formatString.endsWith('f')) {
    const decimals = Number(formatString.slice(2, -1));
    return Number(numberValue).toFixed(Number.isFinite(decimals) ? decimals : 2);
  }

  return String(value);
});

// Define os atalhos de rotas usados pelos templates para gerar links corretamente.
const endpoints = {
  'main.index': (args = {}) => {
    const queryParts = [];
    if (args.q) queryParts.push(`q=${encodeURIComponent(args.q)}`);
    if (args.category) queryParts.push(`category=${encodeURIComponent(args.category)}`);
    if (args.market) queryParts.push(`market=${encodeURIComponent(args.market)}`);
    if (args.sort) queryParts.push(`sort=${encodeURIComponent(args.sort)}`);
    if (args.page) queryParts.push(`page=${encodeURIComponent(args.page)}`);
    return queryParts.length > 0 ? `/?${queryParts.join('&')}` : '/';
  },
  'main.login': () => '/login',
  'main.register': () => '/cadastro',
  'main.logout': () => '/logout',
  'main.recuperar_senha': () => '/recuperar-senha',
  'main.adicionar_produto': () => '/adicionar-produto',
  'main.favoritos': () => '/favoritos',
  'main.meus_cadastros': () => '/meus-cadastros',
  'main.compare': ({ product_id } = {}) => `/comparar/${product_id}`,
  'main.favoritar': ({ product_id } = {}) => `/favoritar/${product_id}`,
  'main.remover_favorito': ({ product_id } = {}) => `/remover-favorito/${product_id}`,
  'main.editar_cadastro': ({ cadastro_id } = {}) => `/meus-cadastros/${cadastro_id}/editar`,
  'main.excluir_cadastro': ({ cadastro_id } = {}) => `/meus-cadastros/${cadastro_id}/excluir`,
  static: ({ filename } = {}) => `/static/${filename}`,
};

// Normaliza os argumentos recebidos para evitar erros quando a função url_for for chamada sem parâmetros.
function normalizeArgs(args) {
  if (args && typeof args === 'object' && !Array.isArray(args)) {
    return args;
  }
  return {};
}

// Gera URLs com base nas rotas definidas acima.
function url_for(endpoint, args = {}) {
  const route = endpoints[endpoint];
  const normalizedArgs = normalizeArgs(args);
  if (typeof route === 'function') {
    return route(normalizedArgs);
  }
  return '/';
}

// Mantém uma função compatível com mensagens flash, mesmo sem uso atual no projeto.
function getFlashMessages(options = {}) {
  if (typeof options === 'object' && options !== null) {
    if (options.with_categories || options.withCategories) {
      return [];
    }
  }
  return [];
}

// Monta um contexto simples do request para ser repassado aos templates.
function buildRequestContext(req) {
  return {
    args: {
      get(name, defaultValue = '') {
        return req.query[name] || defaultValue;
      },
    },
    path: req.path,
    method: req.method,
  };
}

// Lê os dados de produtos do arquivo JSON a cada requisição.
// Atualmente é uma fonte mockada, mas pode ser substituída por um banco de dados no futuro.
function loadProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.error('Erro ao carregar dados de produtos:', error);
    return [];
  }
}

// Normaliza texto para comparação case-insensitive nas buscas e filtros.
function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

// Busca, filtra, ordena os produtos e calcula o menor preço de cada item.
function getSearchResults(query, category, market, sort) {
  const products = loadProducts();
  const normalizedQuery = normalizeText(query);
  const normalizedCategory = normalizeText(category);
  const normalizedMarket = normalizeText(market);

  const filtered = products.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      [product.name, product.brand, product.category].some((field) =>
        normalizeText(field).includes(normalizedQuery)
      );

    const matchesCategory =
      !normalizedCategory ||
      normalizeText(product.category).includes(normalizedCategory);

    const matchesMarket =
      !normalizedMarket ||
      product.prices.some((price) =>
        normalizeText(price.market).includes(normalizedMarket)
      );

    return matchesQuery && matchesCategory && matchesMarket;
  });

  const mapped = filtered.map((product) => {
    const cheapestPrice = product.prices.reduce(
      (min, price) => (price.price < min ? price.price : min),
      Number.POSITIVE_INFINITY
    );

    return {
      ...product,
      // Keep the cheapest product price as a numeric value for sorting and formatting.
      cheapest_price: Number.isFinite(cheapestPrice) ? Number(cheapestPrice.toFixed(2)) : 0,
    };
  });

  if (sort === 'nome') {
    mapped.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  } else {
    mapped.sort((a, b) => a.cheapest_price - b.cheapest_price);
  }

  return mapped;
}

// Extrai as categorias disponíveis a partir da base de produtos.
function getCategories() {
  const products = loadProducts();
  const categories = new Set();
  products.forEach((product) => categories.add(product.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
}

// Extrai os mercados disponíveis a partir dos preços cadastrados.
function getMarkets() {
  const products = loadProducts();
  const markets = new Set();
  products.forEach((product) => {
    product.prices.forEach((price) => markets.add(price.market));
  });
  return Array.from(markets).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
}

// Renderiza um template Nunjucks com o contexto comum da aplicação.
function renderTemplate(res, template, req, context = {}) {
  res.render(template, {
    url_for,
    get_flashed_messages: getFlashMessages,
    request: buildRequestContext(req),
    current_user: { is_authenticated: false },
    ...context,
  });
}

// Organiza os dados do produto para serem usados na página de comparação.
function buildProductCard(product) {
  return {
    ...product,
    prices: product.prices.map((price) => ({
      market: {
        name: price.market,
        address: price.address,
        city: price.city,
      },
      price: price.price,
    })),
  };
}

// Rota principal: exibe a listagem de produtos com busca, filtros e paginação.
app.get('/', (req, res) => {
  const query = req.query.q || '';
  const category = req.query.category || '';
  const market = req.query.market || '';
  const sort = req.query.sort || 'menor-preco';
  const page = Number(req.query.page || 1);
  const perPage = 10;

  const products = getSearchResults(query, category, market, sort);
  const total = products.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(page, 1), pages);
  const paginated = products.slice((currentPage - 1) * perPage, currentPage * perPage).map((product) => ({
    product: product,
    cheapest_price: product.cheapest_price,
  }));

  renderTemplate(res, 'index.html', req, {
    products: paginated,
    pagination: {
      page: currentPage,
      pages,
      iter_pages: function () {
        const pagesArray = [];
        for (let i = 1; i <= pages; i += 1) {
          pagesArray.push(i);
        }
        return pagesArray;
      },
    },
    categories: getCategories(),
    markets: getMarkets(),
    query,
    category,
    market,
    sort,
  });
});

// Endpoint da API usado pelo frontend para carregar produtos sem recarregar a página.
app.get('/api/produtos', (req, res) => {
  const query = req.query.q || '';
  const category = req.query.category || '';
  const market = req.query.market || '';
  const sort = req.query.sort || 'menor-preco';
  const page = Number(req.query.page || 1);
  const perPage = Number(req.query.per_page || 10);

  const products = getSearchResults(query, category, market, sort);
  const total = products.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(page, 1), pages);
  const paginated = products.slice((currentPage - 1) * perPage, currentPage * perPage);

  const payload = paginated.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    image_url: product.image_url,
    cheapest_price: product.cheapest_price,
  }));

  res.json({
    products: payload,
    pagination: {
      total,
      page: currentPage,
      pages,
      per_page: perPage,
    },
  });
});

// Rota de comparação: mostra os preços de um produto em diferentes mercados.
app.get('/comparar/:product_id', (req, res) => {
  const productId = Number(req.params.product_id);
  const product = loadProducts().find((item) => item.id === productId);

  if (!product) {
    return res.status(404).send('Produto não encontrado');
  }

  const prices = product.prices
    .map((price) => ({
      market: {
        name: price.market,
        address: price.address,
        city: price.city,
      },
      price: price.price,
    }))
    .sort((a, b) => a.price - b.price);

  if (!prices.length) {
    return res.redirect('/');
  }

  const cheapestPrice = prices[0];
  const topThreePrices = prices.slice(0, 3);
  const savings = Number((prices[prices.length - 1].price - cheapestPrice.price).toFixed(2));

  renderTemplate(res, 'compare.html', req, {
    product: buildProductCard(product),
    prices: topThreePrices,
    savings,
    cheapestPrice,
  });
});

// Rotas básicas de navegação e ações do aplicativo.
app.get('/adicionar-produto', (req, res) => {
  renderTemplate(res, 'add_product.html', req);
});

app.post('/adicionar-produto', (req, res) => {
  res.redirect('/');
});

app.get('/favoritos', (req, res) => {
  renderTemplate(res, 'favorites.html', req, {
    favorites: [],
  });
});

app.post('/favoritar/:product_id', (req, res) => {
  res.redirect('/login');
});

app.post('/remover-favorito/:product_id', (req, res) => {
  res.redirect('/favoritos');
});

app.get('/meus-cadastros', (req, res) => {
  renderTemplate(res, 'cadastros.html', req, {
    cadastros: [],
  });
});

app.get('/meus-cadastros/:cadastro_id/editar', (req, res) => {
  res.redirect('/meus-cadastros');
});

app.post('/meus-cadastros/:cadastro_id/excluir', (req, res) => {
  res.redirect('/meus-cadastros');
});

app.get('/login', (req, res) => {
  renderTemplate(res, 'auth/login.html', req);
});

app.post('/login', (req, res) => {
  res.redirect('/');
});

app.get('/cadastro', (req, res) => {
  renderTemplate(res, 'auth/register.html', req);
});

app.post('/cadastro', (req, res) => {
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/recuperar-senha', (req, res) => {
  renderTemplate(res, 'auth/reset_password.html', req);
});

app.post('/recuperar-senha', (req, res) => {
  res.redirect('/login');
});

// Middleware para rotas não encontradas.
app.use((req, res) => {
  res.status(404).send('Página não encontrada');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
