import { publicJWK } from '../keys.js'

export const jwksController = {
  handler() {
    return {
      keys: [publicJWK]
    }
  }
}
