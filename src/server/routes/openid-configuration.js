import { config } from '../../config/config.js'

/**
 * The discovery document OIDC clients fetch before anything else. `issuer` must
 * equal the url the client fetched this from, or the client rejects it, which
 * is why it comes from config rather than the incoming request.
 *
 * Advertising S256 keeps relying parties on the PKCE branch rather than the
 * nonce branch, matching how the real Entra ID handshake runs.
 */
export const openidConfiguration = {
  method: 'GET',
  path: '/.well-known/openid-configuration',
  handler() {
    const issuer = config.get('oidc.issuer')

    return {
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      jwks_uri: `${issuer}/jwks`,
      response_types_supported: ['code'],
      response_modes_supported: ['query', 'form_post'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      code_challenge_methods_supported: ['S256'],
      scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
      token_endpoint_auth_methods_supported: ['client_secret_post'],
      claims_supported: [
        'iss',
        'aud',
        'sub',
        'exp',
        'iat',
        'oid',
        'name',
        'email',
        'preferred_username',
        'roles'
      ]
    }
  }
}
