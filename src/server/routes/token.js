import Boom from '@hapi/boom'
import { authCodes } from '../common/auth-codes.js'
import { clients } from '../common/clients.js'
import { createToken } from '../common/create-token.js'

export const token = {
  method: 'POST',
  path: '/token',
  async handler(request) {
    const {
      code,
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

    if (grantType !== 'authorization_code') {
      throw Boom.badRequest('Unsupported grant_type')
    }

    const authCode = authCodes[code]

    if (!authCode) {
      throw Boom.unauthorized('Invalid or expired authorization code')
    }

    if (authCode.clientId !== clientId) {
      throw Boom.unauthorized('Client ID mismatch')
    }

    const { user } = authCode

    const token = await createToken({
      user,
      clientId,
      scope: authCode.scope
    })

    delete authCodes[code]

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    }
  }
}
