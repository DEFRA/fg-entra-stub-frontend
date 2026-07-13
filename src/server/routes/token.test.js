import { decodeJwt } from 'jose'

import { createServer } from '../server.js'
import { authCodes } from '../common/auth-codes.js'
import { refreshTokens } from '../common/refresh-tokens.js'
import { users } from '../common/users.js'
import { config } from '../../config/config.js'

const user = users[0]

const seedAuthCode = ({
  code = 'test-code',
  clientId = 'client1',
  scope = 'openid profile email offline_access',
  nonce
} = {}) => {
  authCodes[code] = { clientId, scope, nonce, user }

  return code
}

const postToken = (server, payload) =>
  server.inject({
    method: 'POST',
    url: '/token',
    payload: {
      client_id: 'client1',
      client_secret: 'secret1',
      ...payload
    }
  })

const exchangeCode = (server, payload) =>
  postToken(server, { grant_type: 'authorization_code', ...payload })

describe('#token', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(() => {
    for (const key of Object.keys(authCodes)) delete authCodes[key]
    for (const key of Object.keys(refreshTokens)) delete refreshTokens[key]
  })

  describe('client authentication', () => {
    test('rejects an unknown client', async () => {
      const { statusCode } = await exchangeCode(server, {
        code: seedAuthCode(),
        client_id: 'nope'
      })

      expect(statusCode).toBe(400)
    })

    test('rejects a wrong client secret', async () => {
      const { statusCode } = await exchangeCode(server, {
        code: seedAuthCode(),
        client_secret: 'wrong'
      })

      expect(statusCode).toBe(401)
    })
  })

  describe('authorization_code grant', () => {
    test('issues an id token audienced at the client', async () => {
      const { statusCode, result } = await exchangeCode(server, {
        code: seedAuthCode()
      })

      expect(statusCode).toBe(200)

      const claims = decodeJwt(result.id_token)

      expect(claims.aud).toBe('client1')
      expect(claims.iss).toBe(config.get('oidc.issuer'))
      expect(claims.sub).toBe(user.id)
      expect(claims.roles).toEqual(user.roles)
    })

    test('issues an access token audienced at the api', async () => {
      const { result } = await exchangeCode(server, { code: seedAuthCode() })

      const claims = decodeJwt(result.access_token)

      expect(claims.aud).toBe('api://client1')
      expect(claims.iss).toBe(config.get('oidc.issuer'))
    })

    // Relying parties that use PKCE send no nonce, and reject an id token
    // carrying one they never asked for.
    test('omits the nonce claim when the request carried no nonce', async () => {
      const { result } = await exchangeCode(server, { code: seedAuthCode() })

      expect(decodeJwt(result.id_token).nonce).toBeUndefined()
    })

    test('echoes the nonce back when the request carried one', async () => {
      const { result } = await exchangeCode(server, {
        code: seedAuthCode({ nonce: 'n-123' })
      })

      expect(decodeJwt(result.id_token).nonce).toBe('n-123')
    })

    test('issues a refresh token only when offline_access was asked for', async () => {
      const { result: offline } = await exchangeCode(server, {
        code: seedAuthCode({ code: 'a', scope: 'openid offline_access' })
      })
      const { result: online } = await exchangeCode(server, {
        code: seedAuthCode({ code: 'b', scope: 'openid profile' })
      })

      expect(offline.refresh_token).toEqual(expect.any(String))
      expect(online.refresh_token).toBeUndefined()
    })

    test('spends the authorization code, so it cannot be replayed', async () => {
      const code = seedAuthCode()

      await exchangeCode(server, { code })
      const { statusCode } = await exchangeCode(server, { code })

      expect(statusCode).toBe(401)
    })

    test('rejects a code issued to another client', async () => {
      const { statusCode } = await exchangeCode(server, {
        code: seedAuthCode({ clientId: 'other' })
      })

      expect(statusCode).toBe(401)
    })
  })

  describe('refresh_token grant', () => {
    const refresh = (refreshToken) =>
      postToken(server, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })

    const login = async () => {
      const { result } = await exchangeCode(server, { code: seedAuthCode() })

      return result.refresh_token
    }

    test('exchanges a refresh token for a fresh token set', async () => {
      const { statusCode, result } = await refresh(await login())

      expect(statusCode).toBe(200)
      expect(decodeJwt(result.access_token).sub).toBe(user.id)
      expect(decodeJwt(result.id_token).sub).toBe(user.id)
    })

    test('rotates the refresh token, retiring the one just spent', async () => {
      const refreshToken = await login()

      const { result } = await refresh(refreshToken)
      expect(result.refresh_token).not.toBe(refreshToken)

      const { statusCode } = await refresh(refreshToken)
      expect(statusCode).toBe(401)
    })

    test('rejects an unknown refresh token', async () => {
      const { statusCode } = await refresh('never-issued')

      expect(statusCode).toBe(401)
    })
  })

  test('rejects an unsupported grant type', async () => {
    const { statusCode } = await postToken(server, {
      grant_type: 'client_credentials'
    })

    expect(statusCode).toBe(400)
  })
})
