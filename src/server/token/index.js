import { tokenGetController, tokenPostController } from './controller.js'

export const token = {
  plugin: {
    name: 'token',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/token',
          ...tokenGetController
        },
        {
          method: 'POST',
          path: '/token',
          ...tokenPostController
        }
      ])
    }
  }
}
