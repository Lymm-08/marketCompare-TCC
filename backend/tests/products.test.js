const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../server');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/products.json');
const USERS_FILE = path.join(__dirname, '../src/data/users.json');

const initialProducts = [
  {
    id: 1,
    name: 'Arroz',
    brand: 'Camil',
    category: 'Mercearia',
    image_url: '/arroz.jpg',
    prices: [
      { market: 'Mercado A', address: 'Rua Um, 10', city: 'São Paulo', price: 20 },
      { market: 'Mercado B', address: 'Rua Dois, 20', city: 'São Paulo', price: 18.5 },
    ],
  },
  {
    id: 2,
    name: 'Feijão',
    brand: 'Camil',
    category: 'Mercearia',
    image_url: '/feijao.jpg',
    prices: [{ market: 'Mercado A', address: 'Rua Um, 10', city: 'São Paulo', price: 9.75 }],
  },
  {
    id: 3,
    name: 'Café',
    brand: 'Pilão',
    category: 'Bebidas',
    image_url: '/cafe.jpg',
    prices: [{ market: 'Mercado C', address: 'Rua Três, 30', city: 'Campinas', price: 15 }],
  },
];

const testUser = {
  id: 1,
  name: 'Pessoa Teste',
  email: 'teste@example.com',
  password: 'senha123',
};

const validProduct = {
  name: 'Macarrão',
  brand: 'Adria',
  category: 'Mercearia',
  market_name: 'Mercado A',
  address: 'Rua Um, 10',
  city: 'São Paulo',
  price: '7.25',
  image_url: '/macarrao.jpg',
};

describe('API de produtos', () => {
  let products;
  let readFileSync;
  let writeFileSync;

  beforeEach(() => {
    products = JSON.parse(JSON.stringify(initialProducts));
    readFileSync = jest.spyOn(fs, 'readFileSync').mockImplementation((filePath, ...args) => {
      if (path.resolve(filePath) === path.resolve(PRODUCTS_FILE)) {
        return JSON.stringify({ products });
      }
      if (path.resolve(filePath) === path.resolve(USERS_FILE)) {
        return JSON.stringify({ users: [testUser] });
      }
      return jest.requireActual('fs').readFileSync(filePath, ...args);
    });
    writeFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation((filePath, contents) => {
      if (path.resolve(filePath) === path.resolve(PRODUCTS_FILE)) {
        products = JSON.parse(contents).products;
      }
    });
  });

  afterEach(() => {
    readFileSync.mockRestore();
    writeFileSync.mockRestore();
  });

  async function authenticatedAgent() {
    const agent = request.agent(app);
    await agent
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    return agent;
  }

  test('lista os produtos ordenados pelo menor preço e retorna paginação e filtros', async () => {
    const response = await request(app).get('/api/produtos').expect(200);

    expect(response.body.products.map((product) => product.id)).toEqual([2, 3, 1]);
    expect(response.body.products[2].cheapest_price).toBe(18.5);
    expect(response.body.pagination).toEqual({
      page: 1,
      pages: 1,
      pageSize: 12,
      total: 3,
    });
    expect(response.body.filters.categories).toEqual(['Bebidas', 'Mercearia']);
    expect(response.body.filters.markets).toEqual(['Mercado A', 'Mercado B', 'Mercado C']);
  });

  test('filtra produtos por texto, categoria e mercado', async () => {
    const response = await request(app)
      .get('/api/produtos')
      .query({ q: 'arroz', category: 'Mercearia', market: 'Mercado B' })
      .expect(200);

    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0]).toMatchObject({ id: 1, name: 'Arroz' });
  });

  test('disponibiliza dados e preços de um produto para comparação', async () => {
    const response = await request(app).get('/api/produtos/1').expect(200);

    expect(response.body.product).toMatchObject({
      id: 1,
      name: 'Arroz',
      prices: [
        { market: 'Mercado A', price: 20 },
        { market: 'Mercado B', price: 18.5 },
      ],
    });
    await request(app).get('/comparar/1').expect(200);
  });

  test('retorna 404 ao buscar um produto inexistente', async () => {
    const response = await request(app).get('/api/produtos/999').expect(404);

    expect(response.body.message).toBe('Produto não encontrado');
  });

  test('cadastra um produto válido e persiste apenas no arquivo simulado', async () => {
    const agent = await authenticatedAgent();
    const response = await agent.post('/api/produtos').send(validProduct).expect(201);

    expect(response.body.cadastro).toMatchObject({
      ownerEmail: testUser.email,
      name: validProduct.name,
      prices: [{ market: validProduct.market_name, price: 7.25 }],
    });
    expect(writeFileSync).toHaveBeenCalledWith(
      PRODUCTS_FILE,
      expect.any(String)
    );

    const registrations = await agent.get('/api/meus-cadastros').expect(200);
    expect(registrations.body).toContainEqual(response.body.cadastro);
  });

  test.each([
    ['campo obrigatório ausente', { ...validProduct, name: '' }],
    ['preço não numérico', { ...validProduct, price: 'inválido' }],
    ['preço zero', { ...validProduct, price: '0' }],
    ['preço negativo', { ...validProduct, price: '-1' }],
  ])('rejeita cadastro com %s', async (_description, product) => {
    const agent = await authenticatedAgent();
    const response = await agent.post('/api/produtos').send(product).expect(400);

    expect(response.body.message).toMatch(/valores válidos/);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  test('exige autenticação para cadastrar um produto', async () => {
    await request(app).post('/api/produtos').send(validProduct).expect(401);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  test('edita um cadastro pertencente ao usuário autenticado', async () => {
    const agent = await authenticatedAgent();
    const createResponse = await agent.post('/api/produtos').send(validProduct).expect(201);
    const cadastroId = createResponse.body.cadastro.id;
    const updatedProduct = { ...validProduct, name: 'Macarrão Integral', price: '8.5' };

    const response = await agent
      .put(`/api/meus-cadastros/${cadastroId}`)
      .send(updatedProduct)
      .expect(200);

    expect(response.body.product).toMatchObject({
      id: cadastroId,
      name: 'Macarrão Integral',
      prices: [{ price: 8.5 }],
    });
    expect(products.find((product) => product.id === cadastroId).name).toBe('Macarrão Integral');
  });

  test('rejeita edição com dados inválidos sem alterar o cadastro', async () => {
    const agent = await authenticatedAgent();
    const createResponse = await agent.post('/api/produtos').send(validProduct).expect(201);
    const cadastroId = createResponse.body.cadastro.id;
    const previousProduct = products.find((product) => product.id === cadastroId);

    await agent
      .put(`/api/meus-cadastros/${cadastroId}`)
      .send({ ...validProduct, price: '-2' })
      .expect(400);

    expect(products.find((product) => product.id === cadastroId)).toEqual(previousProduct);
  });

  test('não permite editar cadastro de outro usuário', async () => {
    const agent = await authenticatedAgent();

    await agent
      .put('/api/meus-cadastros/1')
      .send(validProduct)
      .expect(404);
  });

  test('exclui um cadastro do usuário e mantém os demais produtos', async () => {
    const agent = await authenticatedAgent();
    const createResponse = await agent.post('/api/produtos').send(validProduct).expect(201);
    const cadastroId = createResponse.body.cadastro.id;

    const response = await agent.delete(`/api/meus-cadastros/${cadastroId}`).expect(200);

    expect(response.body.message).toBe('Produto excluído com sucesso');
    expect(products.some((product) => product.id === cadastroId)).toBe(false);
    expect(products).toHaveLength(initialProducts.length);
  });

  test('retorna 404 ao excluir cadastro inexistente', async () => {
    const agent = await authenticatedAgent();

    await agent.delete('/api/meus-cadastros/999').expect(404);
    expect(writeFileSync).not.toHaveBeenCalled();
  });
});
