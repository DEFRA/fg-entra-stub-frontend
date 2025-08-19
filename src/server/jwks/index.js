import { jwksController } from './controller.js'

export const jwks = {
  plugin: {
    name: 'jwks',
    register(server) {
      server.route({
        method: 'GET',
        path: '/jwks',
        ...jwksController
      })
    }
  }
}
