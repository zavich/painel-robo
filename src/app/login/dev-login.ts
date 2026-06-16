/**
 * Login por e-mail/senha habilitado APENAS em ambiente de desenvolvimento.
 *
 * Em produção a autenticação é feita exclusivamente via SSO (cookie compartilhado
 * no domínio .juri.capital). Como o SSO só funciona nesse domínio, localmente
 * precisamos de um formulário de login tradicional para conseguir uma sessão.
 *
 * `NODE_ENV` é "development" com `next dev` e "production" com `next start`,
 * então este flag é compilado como `false` em qualquer build de produção.
 */
export const isDevLoginEnabled = process.env.NODE_ENV === "development";
