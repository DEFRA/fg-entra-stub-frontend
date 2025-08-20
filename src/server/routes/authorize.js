import Boom from '@hapi/boom'
import { randomUUID } from 'node:crypto'
import { authCodes, clients, users } from '../common/db.js'

const sessions = {}

const assertIsValidQuery = (query) => {
  const client = clients.find((c) => c.id === query.client_id)

  if (!client) {
    throw Boom.badRequest('Invalid client_id')
  }

  if (!client.redirectURIs.includes(query.redirect_uri)) {
    throw Boom.badRequest('Invalid redirect_uri')
  }

  for (const scope of query.scope.split(' ')) {
    if (!client.scopes.includes(scope)) {
      throw Boom.badRequest(`Invalid scope: ${scope}`)
    }
  }

  if (!query.state) {
    throw Boom.badRequest('Missing state parameter')
  }
}

export const authorizeGet = {
  method: 'GET',
  path: '/authorize',
  handler(request, h) {
    assertIsValidQuery(request.query)

    if (request.query.response_type !== 'code') {
      throw Boom.badRequest('Unsupported response_type')
    }

    const session = sessions[request.state.sessionId]

    if (session) {
      const code = randomUUID()

      authCodes[code] = {
        clientId: request.query.client_id,
        scope: request.query.scope,
        user: session.user
      }

      return h.redirect(
        `${request.query.redirect_uri}?code=${code}&state=${request.query.state}`
      )
    }

    return h.view('views/authorize', {
      pageTitle: 'Login',
      heading: 'Login'
    })
  }
}

export const authorizePost = {
  method: 'POST',
  path: '/authorize',
  handler(request, h) {
    assertIsValidQuery(request.query)

    const { email, password } = request.payload

    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return h.view('views/authorize', {
        pageTitle: 'Login',
        heading: 'Login',
        validationErrors: [
          {
            text: 'Invalid email or password',
            href: '#email'
          }
        ]
      })
    }

    const sessionId = randomUUID()
    const code = randomUUID()

    sessions[sessionId] = { user }

    authCodes[code] = {
      clientId: request.query.client_id,
      scope: request.query.scope,
      user
    }

    h.state('sessionId', sessionId)

    return h.redirect(
      `${request.query.redirect_uri}?code=${code}&state=${request.query.state}`
    )
  }
}
