import { load } from 'cheerio'

import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { users } from '../common/users.js'

const redirectUri = 'http://localhost:3000/login/callback'
const url = `/authorize?${new URLSearchParams({
  client_id: 'client1',
  redirect_uri: redirectUri,
  scope: 'openid profile',
  state: 'state1',
  response_type: 'code'
})}`

describe('#authorize', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  const expectRedirectWithCode = ({ statusCode, headers }) => {
    const location = new URL(headers.location)

    expect(statusCode).toBe(statusCodes.found)
    expect(`${location.origin}${location.pathname}`).toBe(redirectUri)
    expect(location.searchParams.get('code')).toEqual(expect.any(String))
    expect(location.searchParams.get('state')).toBe('state1')
  }

  const expectUserList = ($) => {
    const rows = $('[data-testid="user"]')

    expect(rows).toHaveLength(users.length)

    users.forEach((user, i) => {
      const row = rows.eq(i)

      expect(row.text()).toContain(user.name)
      expect(row.text()).toContain(user.username)
      expect(row.text()).toContain(user.roles.join(', '))
      expect(row.find('button[name="username"]').attr('value')).toBe(
        user.username
      )
    })
  }

  const expectError = ({ statusCode, result }) => {
    const $ = load(result)

    expect(statusCode).toBe(statusCodes.ok)
    expect($('.govuk-error-summary').text()).toContain(
      'Invalid user or password'
    )
    expectUserList($)
  }

  test('Should render every user', async () => {
    const { result, statusCode } = await server.inject({ method: 'GET', url })
    const $ = load(result)

    expect(statusCode).toBe(statusCodes.ok)
    expect($('form').attr('method')).toBe('POST')
    expect($('form').attr('action')).toBeUndefined()
    expect($('.govuk-error-summary')).toHaveLength(0)
    expectUserList($)
  })

  test('Should sign in with username only', async () => {
    const response = await server.inject({
      method: 'POST',
      url,
      payload: { username: 'reader@t.gov.uk' }
    })

    expectRedirectWithCode(response)
  })

  test('Should sign in with username and correct password', async () => {
    const response = await server.inject({
      method: 'POST',
      url,
      payload: { username: 'reader@t.gov.uk', password: 'pass' }
    })

    expectRedirectWithCode(response)
  })

  test('Should show error for wrong password', async () => {
    const response = await server.inject({
      method: 'POST',
      url,
      payload: { username: 'reader@t.gov.uk', password: 'wrong' }
    })

    expectError(response)
  })

  test('Should show error for unknown user', async () => {
    const response = await server.inject({
      method: 'POST',
      url,
      payload: { username: 'nobody@t.gov.uk' }
    })

    expectError(response)
  })
})
