const path = require('path');
const express = require('express');
const session = require('express-session');
const mainRoutes = require('./src/routes/mainRoutes');

const app = express();
// A aplicação usa uma única porta para desenvolvimento local.
const PORT = 5000;

// Configuração de Diretórios
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const STATIC_DIR = path.join(FRONTEND_DIR, 'static');
const TEMPLATES_DIR = path.join(FRONTEND_DIR, 'templates');

// Middlewares Globais
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir arquivos estáticos da pasta static em /static e na raiz
app.use('/static', express.static(STATIC_DIR));
app.use(express.static(STATIC_DIR)); 
app.use(express.static(FRONTEND_DIR));

// Configuração de Sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'marketcompare-node-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Importação e Utilização das Rotas
app.use('/', mainRoutes);

// Middleware 404
app.use((req, res) => {
  res.status(404).send('Página não encontrada');
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});