import { config } from '../../config/config.js'

const originOf = (hostname) => `http://${hostname}:${config.get('port')}`

export const discovery = {
  method: 'GET',
  path: '/.well-known/openid-configuration',
  handler() {
    const issuer = originOf('localhost')
    const internalIssuer = originOf(
      config.get('internalIssuerHost') ?? 'localhost'
    )

    return {
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${internalIssuer}/token`,
      jwks_uri: `${internalIssuer}/jwks`,
      response_types_supported: ['code'],
      response_modes_supported: ['query', 'form_post'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
      token_endpoint_auth_methods_supported: ['client_secret_post'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256']
    }
  }
}
