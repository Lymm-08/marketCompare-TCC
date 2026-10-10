<div align="center">

# MarketCompare

**Compare preços. Encontre a melhor oferta. Compre com confiança.**

Uma aplicação web para consultar produtos, comparar preços entre mercados e gerenciar cadastros.

[English](README.md)

<br />

![Demonstração do MarketCompare](media/vd_original_marketCompare.gif)

<br />

![Node.js](https://img.shields.io/badge/Node.js-backend-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-testes-C21325?logo=jest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-testes%20HTTP-6A4C93)

</div>

## Conteúdo

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Testes automatizados](#testes-automatizados)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Dados e limitações atuais](#dados-e-limitações-atuais)

## Visão geral

O MarketCompare reúne preços de diferentes mercados em um único catálogo. Os visitantes podem buscar e filtrar produtos, comparar os preços disponíveis e encontrar a menor oferta cadastrada. Usuários autenticados também podem gerenciar seus próprios cadastros de produtos e favoritos.

## Funcionalidades

| Funcionalidade | Descrição | Acesso |
| --- | --- | --- |
| Catálogo de produtos | Consultar, buscar, filtrar por categoria ou mercado e ordenar por nome ou menor preço | Público |
| Comparação de preços | Consultar os mercados e preços cadastrados para um produto | Público |
| Cadastro de produto | Adicionar produto, mercado, endereço, cidade e preço | Requer login |
| Gestão de cadastros | Listar, editar e excluir os produtos enviados pelo usuário autenticado | Requer login |
| Favoritos | Adicionar e remover produtos dos favoritos da sessão atual | Requer login |
| Conta | Criar conta, entrar, sair e redefinir senha | Público |

## Tecnologias

- **Backend:** Node.js, Express e `express-session`
- **Frontend:** HTML, CSS e JavaScript
- **Dados:** arquivos JSON
- **Testes:** Jest e Supertest

## Como executar

### Requisitos

Instale Node.js e npm antes de iniciar.

### Instalação e execução

A partir da raiz do repositório:

```bash
cd backend
npm install
npm start
```

Acesse [http://localhost:5000](http://localhost:5000).

O servidor utiliza a porta `5000`. Configure a variável de ambiente `SESSION_SECRET` para definir o segredo das sessões; se ela não estiver configurada, a aplicação usa um valor padrão de desenvolvimento.

## Testes automatizados

Execute os testes do backend a partir da pasta `backend/`:

```bash
npm test
```

A suíte com Jest e Supertest testa a API Express, incluindo listagem, busca e filtros de produtos, comparação de preços, cadastros válidos e inválidos, edição, exclusão e autenticação. As leituras dos arquivos de produtos e usuários são simuladas, e as gravações de produtos ficam em memória. Assim, os testes não alteram os arquivos JSON.

## Estrutura do projeto

```text
backend/
  server.js
  src/
    controllers/   Controladores de produtos e contas
    data/          Arquivos JSON utilizados pela aplicação
    routes/        Rotas de páginas e da API
    services/      Busca de produtos e funções auxiliares do catálogo
  tests/           Testes da API com Jest e Supertest
frontend/
  static/          CSS, JavaScript e imagens dos produtos
  templates/       Páginas HTML
media/             Demonstração do projeto
```

## Dados e limitações atuais

Os produtos e as contas são armazenados em `backend/src/data/products.json` e `backend/src/data/users.json`. As sessões usam o armazenamento em memória padrão do `express-session` e não persistem após reiniciar o servidor.

Essa configuração é voltada ao desenvolvimento local e à demonstração, não à publicação em produção. Antes de usar contas reais ou disponibilizar a aplicação publicamente, substitua o armazenamento em JSON e o armazenamento de sessões padrão, configure `SESSION_SECRET` com segurança e armazene senhas usando um mecanismo apropriado de hash.
