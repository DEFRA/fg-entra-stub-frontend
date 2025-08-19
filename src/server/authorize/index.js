import {
  authorizeGetController,
  authorizePostController
} from './controller.js'

export const authorize = {
  plugin: {
    name: 'authorize',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/authorize',
          ...authorizeGetController
        },
        {
          method: 'POST',
          path: '/authorize',
          ...authorizePostController
        }
      ])
    }
  }
}
