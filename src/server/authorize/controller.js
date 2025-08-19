import Boom from '@hapi/boom'
import { randomUUID } from 'node:crypto'
import { authCodes, clients, sessions, users } from '../db.js'

export const authorizeGetController = {
  handler(request, h) {
    const {
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state
    } = request.query

    if (responseType !== 'code') {
      throw Boom.badRequest('Unsupported response_type')
    }

    const client = clients.find((c) => c.id === clientId)

    if (!client) {
      throw Boom.badRequest('Invalid client_id')
    }

    if (!client.redirectUris.includes(redirectUri)) {
      throw Boom.badRequest('Invalid redirect_uri')
    }

    for (const s of scope.split(' ')) {
      if (!client.scopes.includes(s)) {
        throw Boom.badRequest(`Invalid scope: ${s}`)
      }
    }

    const sessionId = request.state.session

    if (sessions[sessionId]) {
      const code = randomUUID()

      authCodes[code] = {
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        user: sessions[sessionId]
      }

      return h.redirect(`${redirectUri}?code=${code}&state=${state}`)
    }

    return h.view('authorize/index', {
      pageTitle: 'Login',
      heading: 'Login'
    })
  }
}

export const authorizePostController = {
  method: 'POST',
  path: '/authorize',
  handler(request, h) {
    const {
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state
    } = request.query

    const client = clients.find((c) => c.id === clientId)

    if (!client) {
      throw Boom.badRequest('Invalid client_id')
    }

    if (!client.redirectUris.includes(redirectUri)) {
      throw Boom.badRequest('Invalid redirect_uri')
    }

    for (const s of scope.split(' ')) {
      if (!client.scopes.includes(s)) {
        throw Boom.badRequest(`Invalid scope: ${s}`)
      }
    }

    if (!state) {
      throw Boom.badRequest('Missing state parameter')
    }

    const { username, password } = request.payload

    const user = users.find(
      (u) => u.username === username && u.password === password
    )

    console.log('User:', user)
    if (!user) {
      return h.view('authorize/index', {
        pageTitle: 'Login',
        heading: 'Login',
        validationErrors: [
          {
            text: 'Invalid username or password',
            href: '#username'
          }
        ]
      })
    }

    const sessionId = randomUUID()
    sessions[sessionId] = username

    const code = randomUUID()
    authCodes[code] = {
      clientId,
      userId: user.id,
      scope
    }

    h.state('session', sessionId)

    return h.redirect(`${redirectUri}?code=${code}&state=${state}`)
  }
}
