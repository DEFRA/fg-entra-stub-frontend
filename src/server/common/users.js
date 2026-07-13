export const users = [
  {
    id: '9f6b80d3-99d3-42dc-ac42-b184595b1ef1',
    username: 'admin@t.gov.uk',
    password: 'pass',
    name: 'Test Admin',
    roles: ['FCP.Casework.Admin']
  },
  {
    id: '4c2915b8-527a-4ec5-bcd2-eb769a198ead',
    username: 'admin_rw@t.gov.uk',
    password: 'pass',
    name: 'Test Admin ReaderWriter',
    roles: ['FCP.Casework.Admin', 'FCP.Casework.ReadWrite']
  },
  {
    id: '8b7e28f3-44de-453a-a775-77d11ea9b9a3',
    username: 'reader@t.gov.uk',
    password: 'pass',
    name: 'Test Reader',
    roles: ['FCP.Casework.Read']
  },
  {
    id: 'df20f4bd-d009-4bf4-b499-46e93e0f005a',
    username: 'readerwriter@t.gov.uk',
    password: 'pass',
    name: 'Test ReaderWriter',
    roles: ['FCP.Casework.ReadWrite']
  },
  {
    id: '2a1f9c64-0b3e-4f2a-9a5e-6c7d8e9f0a1b',
    username: 'operations@t.gov.uk',
    password: 'pass',
    name: 'Olivia Operations',
    roles: ['FCP.GrantOperationsAdmin']
  },
  {
    id: '3b2e8d75-1c4f-4a3b-8b6f-7d8e9f0a1b2c',
    username: 'applications@t.gov.uk',
    password: 'pass',
    name: 'Alan Applications',
    roles: ['FCP.GrantApplicationsAdmin']
  },
  {
    id: '4c3d7e86-2d5a-4b4c-9c7a-8e9f0a1b2c3d',
    username: 'grants_admin@t.gov.uk',
    password: 'pass',
    name: 'Bianca Both',
    roles: ['FCP.GrantApplicationsAdmin', 'FCP.GrantOperationsAdmin']
  },
  {
    id: '5d4e6f97-3e6b-4c5d-8d8b-9f0a1b2c3d4e',
    username: 'noroles@t.gov.uk',
    password: 'pass',
    name: 'Nadia None',
    roles: []
  }
]
