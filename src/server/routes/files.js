import { config } from '../../config/config.js'

export const files = {
  method: 'GET',
  path: `${config.get('assetPath')}/{param*}`,
  options: {
    auth: false,
    cache: {
      expiresIn: config.get('staticCacheTimeout'),
      privacy: 'private'
    }
  },
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true
    }
  }
}
