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

## Como criar o banco no MySQL

1. Abra o MySQL Workbench, phpMyAdmin ou o terminal do MySQL.
2. Crie o banco:

```sql
CREATE DATABASE marketcompare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Execute o script SQL do projeto:

```bash
mysql -u root -p < database/marketcompare_mysql.sql
```

Também é possível abrir [database/marketcompare_mysql.sql](database/marketcompare_mysql.sql) no seu cliente MySQL e executar o conteúdo.

## Executar a aplicação

```bash
cd backend
npm start
```

Acesse o seguinte endereço no navegador:

```text
http://localhost:5000
```
