import { createServer } from '../server.js'
import { config } from '../../config/config.js'

describe('#openidConfiguration', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const discover = () =>
    server.inject({
      method: 'GET',
      url: '/.well-known/openid-configuration'
    })

  test('advertises endpoints beneath the configured issuer', async () => {
    const { statusCode, result } = await discover()
    const issuer = config.get('oidc.issuer')

    expect(statusCode).toBe(200)
    expect(result).toMatchObject({
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      jwks_uri: `${issuer}/jwks`
    })
  })

  test('advertises PKCE, so clients do not fall back to a nonce', async () => {
    const { result } = await discover()

    expect(result.code_challenge_methods_supported).toContain('S256')
  })

  test('advertises the grants and client authentication it implements', async () => {
    const { result } = await discover()

    expect(result.grant_types_supported).toEqual([
      'authorization_code',
      'refresh_token'
    ])
    expect(result.token_endpoint_auth_methods_supported).toEqual([
      'client_secret_post'
    ])
    expect(result.id_token_signing_alg_values_supported).toEqual(['RS256'])
  })
})
