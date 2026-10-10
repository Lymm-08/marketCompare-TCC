<div align="center">

# MarketCompare

**Compare prices. Find the best offer. Shop with confidence.**

A web application for browsing products, comparing prices across markets, and managing product listings.

[Português (Brasil)](README.pt-BR.md)

<br />

![MarketCompare demo](media/vd_original_marketCompare.gif)

<br />

![Node.js](https://img.shields.io/badge/Node.js-backend-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-tests-C21325?logo=jest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-HTTP%20tests-6A4C93)

</div>

## Contents

- [Overview](#overview)
- [Features](#features)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Automated tests](#automated-tests)
- [Project structure](#project-structure)
- [Data and current limitations](#data-and-current-limitations)

## Overview

MarketCompare brings product prices from different markets together in one catalog. Visitors can search and filter products, compare available prices, and find the lowest listed offer. Signed-in users can manage their own product listings and favorites.

## Features

| Feature | Description | Access |
| --- | --- | --- |
| Product catalog | Browse, search, filter by category or market, and sort by name or lowest price | Public |
| Price comparison | View a product's market listings and prices | Public |
| Product registration | Add a product with its market, address, city, and price | Sign-in required |
| Manage registrations | List, edit, and delete products submitted by the signed-in user | Sign-in required |
| Favorites | Add and remove products from the current session's favorites | Sign-in required |
| Account | Register, sign in, sign out, and reset a password | Public |

## Technology

- **Backend:** Node.js, Express, and `express-session`
- **Frontend:** HTML, CSS, and JavaScript
- **Data:** JSON files
- **Testing:** Jest and Supertest

## Getting started

### Requirements

Install Node.js and npm before starting.

### Install and run

From the repository root:

```bash
cd backend
npm install
npm start
```

Open [http://localhost:5000](http://localhost:5000).

The server listens on port `5000`. Set the `SESSION_SECRET` environment variable to provide a session secret; the application has a development fallback when it is not set.

## Automated tests

Run the backend test suite from `backend/`:

```bash
npm test
```

The Jest and Supertest suite exercises the Express API, including product listing, search and filters, price comparison, valid and invalid registration, editing, deletion, and authentication. Product and user file reads are mocked, and product writes are captured in memory, so tests do not change the JSON data files.

## Project structure

```text
backend/
  server.js
  src/
    controllers/   Request handlers for products and accounts
    data/          JSON files used by the application
    routes/        Page and API routes
    services/      Product search and catalog helpers
  tests/           Jest and Supertest API tests
frontend/
  static/          CSS, JavaScript, and product images
  templates/       HTML pages
media/             Project demo
```

## Data and current limitations

Product and account records are stored in `backend/src/data/products.json` and `backend/src/data/users.json`. User sessions use the default in-memory store provided by `express-session`; sessions do not persist across server restarts.

This setup is intended for local development and demonstration, not production deployment. Before using real accounts or deploying publicly, replace JSON storage and the default session store, securely configure `SESSION_SECRET`, and store passwords using a suitable password-hashing scheme.
