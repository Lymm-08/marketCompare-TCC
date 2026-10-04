const path = require('path');
const fs = require('fs');

// Caminho correto apontando para src/data/products.json
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function loadProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      console.error('Arquivo products.json não encontrado em:', PRODUCTS_FILE);
      return [];
    }
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.error('Erro ao carregar dados de produtos:', error);
    return [];
  }
}

exports.loadProducts = loadProducts;

exports.getSearchResults = (query, category, market, sort) => {
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
      cheapest_price: Number.isFinite(cheapestPrice) ? Number(cheapestPrice.toFixed(2)) : 0,
    };
  });

  if (sort === 'nome') {
    mapped.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  } else {
    mapped.sort((a, b) => a.cheapest_price - b.cheapest_price);
  }

  return mapped;
};

exports.getCategories = () => {
  const products = loadProducts();
  const categories = new Set();
  products.forEach((product) => categories.add(product.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
};

exports.getMarkets = () => {
  const products = loadProducts();
  const markets = new Set();
  products.forEach((product) => {
    product.prices.forEach((price) => markets.add(price.market));
  });
  return Array.from(markets).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
};