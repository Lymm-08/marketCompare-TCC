# MarketCompare

O MarketCompare é uma aplicação web para comparar preços de produtos em diferentes mercados. O projeto conta com backend em Node.js e Express, interface web e armazenamento em arquivos JSON para produtos e contas de usuários.

🌐 Idioma: Português | 🇺🇸 [English](README.md)

## Funcionalidades

| Área | Recursos |
| --- | --- |
| Catálogo de produtos | Listagem, busca e filtros por nome, categoria, mercado e menor preço |
| Comparação de preços | Consulta dos preços de um produto nos mercados disponíveis |
| Cadastros de produtos | Criação, listagem, edição e exclusão de produtos pelo usuário autenticado |
| Contas | Cadastro, login, logout e redefinição de senha |
| Favoritos | Inclusão e remoção de produtos favoritos durante a sessão autenticada |

Os dados de produtos e contas são armazenados em `backend/src/data/products.json` e `backend/src/data/users.json`. As rotas protegidas usam sessões do Express.

## Tecnologias

- Node.js e Express
- Dependência Nunjucks e templates HTML
- HTML, CSS e JavaScript
- Jest e Supertest para testes automatizados do backend

## Estrutura do projeto

```text
backend/
  server.js
  src/
    controllers/
    data/
    routes/
    services/
  tests/
frontend/
  static/
  templates/
media/
```

## Executar localmente

Instale as dependências e inicie o servidor:

```bash
cd backend
npm install
npm start
```

A aplicação estará disponível em [http://localhost:5000](http://localhost:5000).

## Testes

Execute a suíte automatizada do backend a partir da pasta `backend/`:

```bash
npm test
```

Os testes cobrem listagem, busca e filtros de produtos, comparação de preços, cadastro válido e inválido, edição, exclusão e exigência de autenticação. As leituras e gravações de arquivos são simuladas para que a suíte não altere os arquivos JSON do projeto. São utilizadas as ferramentas [Jest](https://jestjs.io/) para execução dos testes e [Supertest](https://github.com/ladjs/supertest) para testar a aplicação Express por HTTP.

## Demonstração

![Demonstração do MarketCompare](media/vd_original_marketCompare.gif)
