import Boom from '@hapi/boom'
import { clients, users } from '../common/db.js'
import { createToken } from '../common/create-token.js'

export const sign = {
  method: 'POST',
  path: '/sign',
  async handler(request) {
    const { clientId, email } = request.payload

    const client = clients.find((c) => c.id === clientId)

    if (!client) {
      throw Boom.badRequest('Invalid client_id')
    }

    const user = users.find((u) => u.email === email)

    if (!user) {
      throw Boom.notFound('User not found')
    }

    const token = await createToken({
      user,
      clientId,
      scope: `openid profile email api://${clientId}/cw.backend`
    })

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    }
  }
}
