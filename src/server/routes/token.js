import Boom from '@hapi/boom'
import { randomUUID } from 'node:crypto'
import { authCodes } from '../common/auth-codes.js'
import { clients } from '../common/clients.js'
import { refreshTokens } from '../common/refresh-tokens.js'
import { createToken } from '../common/create-token.js'

const issueTokens = async ({ clientId, user, scope }) => {
  const [accessToken, idToken] = await Promise.all([
    createToken({ user, clientId, scope }),
    createToken({
      user,
      clientId,
      scope,
      audience: clientId,
      includeNonce: false
    })
  ])

  const response = {
    access_token: accessToken,
    id_token: idToken,
    token_type: 'Bearer',
    expires_in: 3600
  }

  if (scope.split(' ').includes('offline_access')) {
    const refreshToken = randomUUID()
    refreshTokens[refreshToken] = { clientId, user, scope }
    response.refresh_token = refreshToken
  }

  return response
}

export const token = {
  method: 'POST',
  path: '/token',
  async handler(request) {
    const {
      grant_type: grantType,
      client_id: clientId,
      client_secret: clientSecret
    } = request.payload

    const client = clients.find((c) => c.id === clientId)

    if (!client) {
      throw Boom.badRequest('Invalid client_id')
    }

    if (client.secret !== clientSecret) {
      throw Boom.unauthorized('Invalid client_secret')
    }

    if (grantType === 'authorization_code') {
      const { code } = request.payload
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
        user: authCode.user,
        scope: authCode.scope
      })
    }

    if (grantType === 'refresh_token') {
      const { refresh_token: refreshToken } = request.payload
      const stored = refreshTokens[refreshToken]

      if (!stored || stored.clientId !== clientId) {
        throw Boom.unauthorized('Invalid or expired refresh token')
      }

      delete refreshTokens[refreshToken]

      return issueTokens({
        clientId,
        user: stored.user,
        scope: stored.scope
      })
    }

    throw Boom.badRequest('Unsupported grant_type')
  }
}
