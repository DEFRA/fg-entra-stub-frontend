import { config } from '../../config/config.js'

/**
 * The browser always reaches this stub on localhost, whether the app driving it
 * runs on the host or inside the compose network, so the endpoints a user agent
 * is sent to are pinned there. `issuer` is pinned too, because it has to match
 * the `iss` claim the tokens are signed with.
 */
const browserOrigin = () => `http://localhost:${config.get('port')}`

/**
 * Endpoints called server to server are reached on whichever name the caller
 * already used to fetch this document, which is the one it carries in the Host
 * header. An app running on the host discovers on `localhost:3010` and is given
 * `localhost:3010` back; the same app inside the compose network discovers on
 * `entra:3010` and is given `entra:3010`. One document serves both without
 * either having to be told which it is.
 */
const internalOrigin = (request) => `http://${request.info.host}`

export const discovery = {
  method: 'GET',
  path: '/.well-known/openid-configuration',
  handler(request) {
    const issuer = browserOrigin()
    const internalIssuer = internalOrigin(request)

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
