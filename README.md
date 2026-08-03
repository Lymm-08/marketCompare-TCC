# MarketCompare

🌎 Language: English | 🇧🇷 [Português](README.pt-BR.md)

This project uses a manually populated database to demonstrate how the system works. In a future version, prices may be updated automatically through integrations with supermarkets.

## Demo Video

See how the website works below:

![MarketCompare demo](media/vd_original_marketCompare.gif)

## Tech Stack

- Node.js
- Express
- Nunjucks
- Bootstrap

## Project Structure

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
```

## How to run locally

### 1) Install dependencies

```bash
cd backend
npm install
```

### 2) Start the server

```bash
npm start
```

Open the following address in your browser:

```text
http://localhost:5000
```
