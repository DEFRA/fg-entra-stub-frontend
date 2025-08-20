export const clients = [
  {
    id: 'client1',
    secret: 'secret1',
    redirectUris: ['http://localhost:3002/login/callback'],
    scopes: [
      'openid',
      'profile',
      'email',
      'offline_access',
      'api://client1/cw.backend'
    ]
  }
]

export const users = [
  {
    id: '9f6b80d3-99d3-42dc-ac42-b184595b1ef1',
    username: 'admin',
    password: 'pass',
    name: 'Test Admin',
    email: 'admin@t.gov.uk',
    roles: ['FCP.Casework.Admin']
  },
  {
    id: '8b7e28f3-44de-453a-a775-77d11ea9b9a3',
    username: 'reader',
    password: 'pass',
    name: 'Test Reader',
    email: 'reader@t.gov.uk',
    roles: ['FCP.Casework.Read']
  },
  {
    id: 'df20f4bd-d009-4bf4-b499-46e93e0f005a',
    username: 'readerwriter',
    password: 'pass',
    name: 'Test ReaderWriter',
    email: 'readerwriter@t.gov.uk',
    roles: ['FCP.Casework.ReadWrite']
  }
]

export const sessions = {}

export const authCodes = {}
