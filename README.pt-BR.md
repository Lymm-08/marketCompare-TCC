# MarketCompare

🌎 Idioma: Português | 🇺🇸 [English](README.md)

MarketCompare é uma aplicação web para comparar preços de produtos e gerenciar itens favoritos. O projeto utiliza um backend em Node.js com Express e uma interface em HTML, CSS e JavaScript puro.

## Demo Video

Veja o funcionamento do site abaixo:

![MarketCompare demo](media/vd_original_marketCompare.gif)

## Stack

- Node.js
- Express
- Nunjucks
- Bootstrap

## Estrutura do projeto

```text
backend/
  package.json
  server.js
frontend/
  static/
    css/
    js/
      image/
  templates/
    auth/
    add_product.html
    base.html
    cadastros.html
    compare.html
    edit_cadastro.html
    favorites.html
    index.html
mock_data/
  products.json
media/

Documentação:
  PROJECT_DOCUMENTATION.md
```

## Como rodar localmente

### 1) Instale as dependências

```bash
cd backend
npm install
```

### 2) Inicie o servidor

```bash
npm start
```

## Executar a aplicação

```bash
cd backend
npm start
```

Acesse o seguinte endereço no navegador:

```text
http://localhost:5000
```
