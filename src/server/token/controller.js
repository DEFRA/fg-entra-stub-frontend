import Boom from '@hapi/boom'
import { SignJWT } from 'jose'
import { randomUUID } from 'node:crypto'
import { authCodes, clients, users } from '../db.js'
import { privateKey, publicJWK } from '../keys.js'
import { config } from '../../config/config.js'

export const tokenGetController = {
  method: 'GET',
  path: '/token',
  async handler(request) {
    const { client_id: clientId, user_id: userId } = request.query

    const client = clients.find((c) => c.id === clientId)

    if (!client) {
      throw Boom.badRequest('Invalid client_id')
    }

    const user = users.find((u) => u.id === userId)

    if (!user) {
      throw Boom.notFound('User not found')
    }

    const token = await new SignJWT({
      scope: 'cw.backend',
      nonce: randomUUID(),
      sub: user.id,
      oid: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles
    })
      .setProtectedHeader({
        alg: 'RS256',
        typ: 'JWT',
        kid: publicJWK.kid
      })
      .setIssuedAt()
      .setIssuer(`http://localhost:${config.get('port')}`)
      .setAudience(`api://${clientId}`)
      .setExpirationTime('1h')
      .sign(privateKey)

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    }
  }
}

export const tokenPostController = {
  method: 'POST',
  path: '/token',
  async handler(request) {
    const {
      grant_type: grantType,
      code,
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

    const user = users.find((u) => u.id === authCode.userId)

    if (!user) {
      throw Boom.notFound('User not found')
    }

    const token = await new SignJWT({
      scope: authCode.scope,
      nonce: randomUUID(),
      sub: user.id,
      oid: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles
    })
      .setProtectedHeader({
        alg: 'RS256',
        typ: 'JWT',
        kid: publicJWK.kid
      })
      .setIssuedAt()
      .setIssuer(`http://localhost:${config.get('port')}`)
      .setAudience(`api://${clientId}`)
      .setExpirationTime('1h')
      .sign(privateKey)

    delete authCodes[code]

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    }
  }
}
