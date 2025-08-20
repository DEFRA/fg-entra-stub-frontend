import { config } from '../../config/config.js'
import { statusCodes } from '../common/constants/status-codes.js'

export const favicon = {
  options: {
    auth: false,
    cache: {
      expiresIn: config.get('staticCacheTimeout'),
      privacy: 'private'
    }
  },
  method: 'GET',
  path: '/favicon.ico',
  handler(_request, h) {
    return h.response().code(statusCodes.noContent).type('image/x-icon')
  }
}
