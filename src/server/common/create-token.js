import { SignJWT } from 'jose'
import { randomUUID } from 'node:crypto'
import { privateKey, publicJWK } from './keys.js'
import { config } from '../../config/config.js'

export const createToken = async ({ user, clientId, scope }) => {
  return await new SignJWT({
    scope,
    sub: user.id,
    oid: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    nonce: randomUUID()
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
}
