const path = require('path');
const fs = require('fs');

const getProductsData = () => {
  const filePath = path.join(__dirname, '../data/products.json');
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);
    return Array.isArray(data) ? data : (data.products || []);
  } catch (error) {
    console.error("Erro ao ler o arquivo products.json:", error);
    return [];
  }
};

// GET /api/produtos -> Retorna os dados em JSON para o frontend
exports.getApiProducts = (req, res) => {
  let products = getProductsData();
  const query = req.query.q || '';
  const category = req.query.category || '';
  const market = req.query.market || '';
  const sort = req.query.sort || 'menor-preco';
  const pageSize = 12;
  const requestedPage = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const getPrices = (product) => Array.isArray(product.prices) ? product.prices : [];
  const getCheapestPrice = (product) => {
    const prices = getPrices(product).map((price) => Number(price.price || price.preco)).filter(Number.isFinite);
    const directPrice = Number(product.preco || product.cheapest_price);
    return Number.isFinite(directPrice) && directPrice > 0 ? directPrice : (prices.length ? Math.min(...prices) : 0);
  };

  // Filtro de busca (nome ou marca)
  if (query) {
    products = products.filter(p =>
      (p.nome || p.produto || p.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (p.marca || p.brand || '').toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filtro por Categoria
  if (category) {
    products = products.filter(p => (p.categoria || p.category) === category);
  }

  // Filtro por Mercado
  if (market) {
    products = products.filter(p => getPrices(p).some((price) => (price.mercado || price.market) === market));
  }

  // Ordenação
  if (sort === 'menor-preco') {
    products.sort((a, b) => getCheapestPrice(a) - getCheapestPrice(b));
  } else if (sort === 'nome') {
    products.sort((a, b) => (a.nome || a.produto || a.name || '').localeCompare(b.nome || b.produto || b.name || ''));
  }

  const total = products.length;
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  const page = Math.min(requestedPage, pages);
  products = products.slice((page - 1) * pageSize, page * pageSize);

  // Padronização dos objetos
  const formattedProducts = products.map(p => ({
    ...p,
    id: p.id || 1,
    name: p.nome || p.produto || p.name || 'Produto sem nome',
    brand: p.marca || p.brand || '',
    category: p.categoria || p.category || 'Geral',
    cheapest_price: getCheapestPrice(p),
    image_url: p.image_url || p.imagem || 'https://via.placeholder.com/300x180'
  }));

  res.status(200).json({
    products: formattedProducts,
    pagination: { page, pages, pageSize, total },
    filters: {
      categories: [...new Set(getProductsData().map((product) => product.category || product.categoria).filter(Boolean))].sort(),
      markets: [...new Set(getProductsData().flatMap((product) => getPrices(product).map((price) => price.market || price.mercado)).filter(Boolean))].sort()
    }
  });
};

exports.getApiProduct = (req, res) => {
  const product = getProductsData().find((item) => String(item.id) === String(req.params.product_id));

  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }

  res.status(200).json({ product });
};

// POST /api/produtos -> Adiciona um novo produto (Função adicionada para não dar undefined)
exports.postAddProduct = (req, res) => {
  const { name, brand, category, market_name, address, city, price, image_url } = req.body;
  const numericPrice = Number(price);

  if (!name || !brand || !market_name || !address || !city || !Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios com valores válidos.' });
  }

  const cadastro = {
    id: Date.now(),
    ownerEmail: req.session.user.email,
    name,
    brand,
    category: category || 'Outros',
    image_url: image_url || '',
    prices: [{ market: market_name, address, city, price: numericPrice }],
    product: { name, brand, category: category || 'Outros', image_url: image_url || '' },
    price: { market: market_name, address, city, price: numericPrice }
  };
  const products = getProductsData();
  products.push(cadastro);
  saveProductsData(products);
  res.status(201).json({ message: 'Produto cadastrado com sucesso', cadastro });
};

exports.getUserProduct = (req, res) => {
  const product = exports.getUserProducts(req.session.user.email)
    .find((item) => String(item.id) === String(req.params.cadastro_id));
  if (!product) return res.status(404).json({ message: 'Produto cadastrado não encontrado.' });
  res.json(product);
};

exports.updateUserProduct = (req, res) => {
  const products = getProductsData();
  const index = products.findIndex((item) => String(item.id) === String(req.params.cadastro_id) && item.ownerEmail === req.session.user.email);
  if (index < 0) return res.status(404).json({ message: 'Produto cadastrado não encontrado.' });

  const { name, brand, category, market_name, address, city, price, image_url } = req.body;
  const numericPrice = Number(price);
  if (!name || !brand || !market_name || !address || !city || !Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios com valores válidos.' });
  }

  products[index] = {
    ...products[index], name, brand, category: category || 'Outros', image_url: image_url || '',
    product: { name, brand, category: category || 'Outros', image_url: image_url || '' },
    prices: [{ market: market_name, address, city, price: numericPrice }],
    price: { market: market_name, address, city, price: numericPrice }
  };
  saveProductsData(products);
  res.json({ message: 'Produto atualizado com sucesso', product: products[index] });
};

exports.deleteUserProduct = (req, res) => {
  const products = getProductsData();
  const remaining = products.filter((item) => !(String(item.id) === String(req.params.cadastro_id) && item.ownerEmail === req.session.user.email));
  if (remaining.length === products.length) return res.status(404).json({ message: 'Produto cadastrado não encontrado.' });
  saveProductsData(remaining);
  res.json({ message: 'Produto excluído com sucesso' });
};

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

const saveProductsData = (products) => {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify({ products }, null, 2));
};

exports.getUserProducts = (email) => getProductsData().filter((product) => product.ownerEmail === email);