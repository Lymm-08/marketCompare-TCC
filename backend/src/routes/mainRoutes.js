const express = require('express');
const path = require('path');
const router = express.Router();
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

// Helper para servir arquivos HTML estáticos se a pasta estiver no backend
// Ajuste o caminho '../frontend' conforme a estrutura de pastas do seu projeto
const viewsPath = path.join(__dirname, '../../../frontend/templates');
// ==========================================
// 1. ROTAS DE PÁGINAS ESTÁTICAS (HTML)
// ==========================================
router.get('/', (req, res) => res.sendFile(path.join(viewsPath, 'index.html')));
router.get('/login', (req, res) => res.sendFile(path.join(viewsPath, 'auth/login.html')));
router.get(['/cadastro', '/register'], (req, res) => res.sendFile(path.join(viewsPath, 'auth/register.html')));
router.get('/recuperar-senha', (req, res) => res.sendFile(path.join(viewsPath, 'auth/reset_password.html')));
router.get('/favoritos', authController.requireAuth, (req, res) => res.sendFile(path.join(viewsPath, 'favorites.html')));
router.get('/meus-cadastros', authController.requireAuth, (req, res) => res.sendFile(path.join(viewsPath, 'cadastros.html')));
router.get('/comparar/:product_id', (req, res) => res.sendFile(path.join(viewsPath, 'compare.html')));
router.get(['/adicionar-produto', '/cadastrar-produto'], authController.requireAuth, (req, res) => res.sendFile(path.join(viewsPath, 'add_product.html')));

// ==========================================
// 2. ENDPOINTS DA API (RETORNAM APENAS JSON)
// ==========================================

// Produtos
router.get('/api/produtos', productController.getApiProducts);
router.get('/api/produtos/:product_id', productController.getApiProduct);
router.post('/api/produtos', authController.requireAuth, productController.postAddProduct);

// Autenticação
router.post('/api/login', authController.postLogin);
router.post('/login', authController.postLogin);
router.post('/api/cadastro', authController.postRegister);
router.post('/register', authController.postRegister);
router.get('/api/logout', authController.logout);
router.get('/logout', authController.logout);
router.get('/api/me', authController.getMe);
router.get('/api/favoritos', authController.requireAuth, authController.getFavorites);
router.get('/api/meus-cadastros', authController.requireAuth, authController.getCadastros);
router.get('/meus-cadastros/:cadastro_id/editar', authController.requireAuth, (req, res) => res.sendFile(path.join(viewsPath, 'edit_cadastro.html')));
router.post('/api/recuperar-senha', authController.postResetPassword);

// Favoritos e Cadastros
router.post('/api/favoritar/:product_id', authController.requireAuth, authController.postFavorite);
router.post('/api/remover-favorito/:product_id', authController.requireAuth, authController.postRemoveFavorite);
router.get('/api/meus-cadastros/:cadastro_id', authController.requireAuth, productController.getUserProduct);
router.put('/api/meus-cadastros/:cadastro_id', authController.requireAuth, productController.updateUserProduct);
router.delete('/api/meus-cadastros/:cadastro_id', authController.requireAuth, productController.deleteUserProduct);

module.exports = router;