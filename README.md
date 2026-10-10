# MarketCompare

MarketCompare is a web application for comparing product prices across markets. It includes a Node.js and Express backend, a browser-based frontend, and JSON-file storage for products and user accounts.

🌐 Language: English | 🇧🇷 [Português](README.pt-BR.md)

## Features

| Area | Capabilities |
| --- | --- |
| Product catalog | Browse, search, filter, and sort products by name, category, market, and lowest price |
| Price comparison | View a product's prices at available markets |
| Product registrations | Create, list, edit, and delete products submitted by the signed-in user |
| Accounts | Register, sign in, sign out, and reset a password |
| Favorites | Add and remove favorite products during the authenticated session |

Product and account data are stored in `backend/src/data/products.json` and `backend/src/data/users.json`. Authenticated routes use Express sessions.

## Technology

- Node.js and Express
- Nunjucks dependency and HTML templates
- HTML, CSS, and JavaScript
- Jest and Supertest for automated backend tests

## Project structure

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

## Run locally

Install dependencies and start the server:

```bash
cd backend
npm install
npm start
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Tests

Run the automated backend suite from the `backend/` directory:

```bash
npm test
```

The tests cover product listing, search and filters, price comparison, valid and invalid product registration, editing, deletion, and authentication requirements. File reads and writes are mocked so the test suite never changes the project's JSON data files. The suite uses [Jest](https://jestjs.io/) as its test runner and [Supertest](https://github.com/ladjs/supertest) to exercise the Express application over HTTP.

## Demo

![MarketCompare demo](media/vd_original_marketCompare.gif)
