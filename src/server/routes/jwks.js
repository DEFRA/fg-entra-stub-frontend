import { publicJWK } from '../common/keys.js'

export const jwks = {
  method: 'GET',
  path: '/jwks',
  handler() {
    return {
      keys: [publicJWK]
    }
  }
}
