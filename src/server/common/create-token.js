import { SignJWT } from 'jose'
import { randomUUID } from 'node:crypto'
import { privateKey, publicJWK } from './keys.js'
import { config } from '../../config/config.js'

const oneHourSeconds = 3600

export const accessTokenTtlSeconds = oneHourSeconds

const sign = ({ claims, audience }) =>
  new SignJWT(claims)
    .setProtectedHeader({
      alg: 'RS256',
      typ: 'JWT',
      kid: publicJWK.kid
    })
    .setIssuedAt()
    .setIssuer(config.get('oidc.issuer'))
    .setAudience(audience)
    .setExpirationTime('1h')
    .sign(privateKey)

/**
 * Access tokens are audienced at the API the client calls, which is what
 * downstream services verify.
 */
export const createToken = async ({ user, clientId, scope }) =>
  sign({
    audience: `api://${clientId}`,
    claims: {
      scope,
      sub: user.id,
      oid: user.id,
      name: user.name,
      email: user.username,
      roles: user.roles,
      nonce: randomUUID()
    }
  })

/**
 * Id tokens are audienced at the client itself, per OIDC core. The `nonce`
 * claim is echoed back only when the authorization request carried one:
 * relying parties that use PKCE send no nonce, and reject an id token bearing
 * one they never asked for.
 */
export const createIdToken = async ({ user, clientId, nonce }) =>
  sign({
    audience: clientId,
    claims: {
      sub: user.id,
      oid: user.id,
      name: user.name,
      email: user.username,
      preferred_username: user.username,
      roles: user.roles,
      ...(nonce && { nonce })
    }
  })
