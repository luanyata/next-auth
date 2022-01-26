export class AuthTokenError extends Error {
  constructor() {
    super('Erro with authentication token')
  }
}