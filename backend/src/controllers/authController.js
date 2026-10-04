const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

const readUsers = () => {
  try {
    const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    return Array.isArray(data) ? data : (data.users || []);
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
};

const validEmail = (email) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/login
exports.postLogin = (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = readUsers().find((item) => item.email === email && item.password === password);

  if (!validEmail(email) || !user) {
    return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.status(200).json({ message: "Login realizado com sucesso", success: true });
};

// POST /api/cadastro
exports.postRegister = (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !validEmail(email) || password.length < 6) {
    return res.status(400).json({ message: 'Informe nome, e-mail válido e senha com pelo menos 6 caracteres.' });
  }

  const users = readUsers();
  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
  }

  const user = { id: Date.now(), name, email, password };
  users.push(user);
  writeUsers(users);
  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.status(201).json({ message: "Cadastro realizado com sucesso", success: true });
};

exports.getMe = (req, res) => {
  res.json({ authenticated: Boolean(req.session.user), user: req.session.user || null });
};

exports.getFavorites = (req, res) => {
  res.json(req.session.favorites || []);
};

exports.getCadastros = (req, res) => {
  const productController = require('./productController');
  res.json(productController.getUserProducts(req.session.user.email));
};

exports.requireAuth = (req, res, next) => {
  if (req.session.user) return next();
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ message: 'Você precisa fazer login para realizar esta ação.' });
  }
  const nextUrl = encodeURIComponent(req.originalUrl);
  return res.redirect(`/login?next=${nextUrl}`);
};

// GET /api/logout
exports.logout = (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.status(200).json({ message: "Sessão encerrada" });
    });
  } else {
    res.status(200).json({ message: "Sessão encerrada" });
  }
};

// POST /api/recuperar-senha
exports.postResetPassword = (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const users = readUsers();
  const userIndex = users.findIndex((user) => user.email === email);

  if (!validEmail(email) || userIndex < 0) {
    return res.status(404).json({ message: 'Não encontramos uma conta com esse e-mail.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'A nova senha precisa ter pelo menos 6 caracteres.' });
  }

  users[userIndex].password = password;
  writeUsers(users);
  res.status(200).json({ message: 'Senha redefinida com sucesso' });
};

// POST /api/favoritar/:product_id
exports.postFavorite = (req, res) => {
  req.session.favorites = req.session.favorites || [];
  if (!req.session.favorites.some((item) => String(item.id) === String(req.params.product_id))) {
    req.session.favorites.push({ id: req.params.product_id });
  }
  res.status(200).json({ message: "Produto favoritado" });
};

// POST /api/remover-favorito/:product_id
exports.postRemoveFavorite = (req, res) => {
  req.session.favorites = (req.session.favorites || []).filter(
    (item) => String(item.id) !== String(req.params.product_id)
  );
  res.status(200).json({ message: "Favorito removido" });
};

// GET /api/meus-cadastros/:cadastro_id/editar
exports.editCadastro = (req, res) => {
  res.status(200).json({ message: "Dados do cadastro recuperados" });
};

// DELETE /api/meus-cadastros/:cadastro_id
exports.deleteCadastro = (req, res) => {
  res.status(200).json({ message: "Cadastro excluído com sucesso" });
};