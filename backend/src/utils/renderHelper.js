const endpoints = {
  'main.index': (args = {}) => {
    const queryParts = [];
    if (args.q) queryParts.push(`q=${encodeURIComponent(args.q)}`);
    if (args.category) queryParts.push(`category=${encodeURIComponent(args.category)}`);
    if (args.market) queryParts.push(`market=${encodeURIComponent(args.market)}`);
    if (args.sort) queryParts.push(`sort=${encodeURIComponent(args.sort)}`);
    if (args.page) queryParts.push(`page=${encodeURIComponent(args.page)}`);
    return queryParts.length > 0 ? `/?${queryParts.join('&')}` : '/';
  },
  'main.login': () => '/login',
  'main.register': () => '/cadastro',
  'main.logout': () => '/logout',
  'main.recuperar_senha': () => '/recuperar-senha',
  'main.adicionar_produto': () => '/adicionar-produto',
  'main.favoritos': () => '/favoritos',
  'main.meus_cadastros': () => '/meus-cadastros',
  'main.compare': ({ product_id } = {}) => `/comparar/${product_id}`,
  'main.favoritar': ({ product_id } = {}) => `/favoritar/${product_id}`,
  'main.remover_favorito': ({ product_id } = {}) => `/remover-favorito/${product_id}`,
  'main.editar_cadastro': ({ cadastro_id } = {}) => `/meus-cadastros/${cadastro_id}/editar`,
  'main.excluir_cadastro': ({ cadastro_id } = {}) => `/meus-cadastros/${cadastro_id}/excluir`,
  static: ({ filename } = {}) => `/static/${filename}`,
};

function normalizeArgs(args) {
  if (args && typeof args === 'object' && !Array.isArray(args)) return args;
  return {};
}

function url_for(endpoint, args = {}) {
  const route = endpoints[endpoint];
  const normalizedArgs = normalizeArgs(args);
  if (typeof route === 'function') return route(normalizedArgs);
  return '/';
}

function getFlashMessages(options = {}) {
  if (typeof options === 'object' && options !== null) {
    if (options.with_categories || options.withCategories) return [];
  }
  return [];
}

function buildRequestContext(req) {
  return {
    args: {
      get(name, defaultValue = '') {
        return req.query[name] || defaultValue;
      },
    },
    path: req.path,
    method: req.method,
  };
}

exports.renderTemplate = (res, template, req, context = {}) => {
  res.render(template, {
    url_for,
    get_flashed_messages: getFlashMessages,
    request: buildRequestContext(req),
    current_user: { is_authenticated: false },
    ...context,
  });
};