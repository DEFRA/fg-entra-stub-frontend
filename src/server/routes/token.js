import Boom from '@hapi/boom'
import { randomUUID } from 'node:crypto'
import { authCodes } from '../common/auth-codes.js'
import { clients } from '../common/clients.js'
import { refreshTokens } from '../common/refresh-tokens.js'
import {
  accessTokenTtlSeconds,
  createIdToken,
  createToken
} from '../common/create-token.js'

/**
 * A refresh token is only issued when the client asked for `offline_access`,
 * as a real provider does. It is opaque, and rotated on every use so one
 * cannot be replayed after it has been redeemed.
 */
const issueRefreshToken = ({ clientId, scope, user }) => {
  if (!scope?.split(' ').includes('offline_access')) {
    return undefined
  }

  const refreshToken = randomUUID()
  refreshTokens[refreshToken] = { clientId, scope, user }

  return refreshToken
}

const issueTokens = async ({ clientId, scope, nonce, user }) => {
  const [accessToken, idToken] = await Promise.all([
    createToken({ user, clientId, scope }),
    createIdToken({ user, clientId, nonce })
  ])

  const refreshToken = issueRefreshToken({ clientId, scope, user })

  return {
    access_token: accessToken,
    id_token: idToken,
    token_type: 'Bearer',
    expires_in: accessTokenTtlSeconds,
    scope,
    ...(refreshToken && { refresh_token: refreshToken })
  }
}

const exchangeAuthorizationCode = ({ code, clientId }) => {
  const authCode = authCodes[code]

  if (!authCode) {
    throw Boom.unauthorized('Invalid or expired authorization code')
  }

  if (authCode.clientId !== clientId) {
    throw Boom.unauthorized('Client ID mismatch')
  }

  delete authCodes[code]

  return issueTokens({
    clientId,
    scope: authCode.scope,
    nonce: authCode.nonce,
    user: authCode.user
  })
}

const exchangeRefreshToken = ({ refreshToken, clientId }) => {
  const grant = refreshTokens[refreshToken]

  if (!grant) {
    throw Boom.unauthorized('Invalid or expired refresh token')
  }

  if (grant.clientId !== clientId) {
    throw Boom.unauthorized('Client ID mismatch')
  }

  delete refreshTokens[refreshToken]

  return issueTokens({
    clientId,
    scope: grant.scope,
    user: grant.user
  })
}

export const token = {
  method: 'POST',
  path: '/token',
  async handler(request) {
    const {
      code,
      grant_type: grantType,
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    } = request.payload

    const client = clients.find((c) => c.id === clientId)

    if (!client) {
      throw Boom.badRequest('Invalid client_id')
    }

    if (client.secret !== clientSecret) {
      throw Boom.unauthorized('Invalid client_secret')
    }

    if (grantType === 'authorization_code') {
      return exchangeAuthorizationCode({ code, clientId })
    }

    if (grantType === 'refresh_token') {
      return exchangeRefreshToken({ refreshToken, clientId })
    }

    throw Boom.badRequest('Unsupported grant_type')
  }
}
