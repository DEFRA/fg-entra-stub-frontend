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
    id: '6ce46e26-1c9d-42fa-89ec-0c9f3ac980dc',
    username: 'grant_applications_admin@t.gov.uk',
    password: 'pass',
    name: 'Test Grant Applications Admin',
    roles: ['FCP.GrantApplicationsAdmin']
  },
  {
    id: 'c5afd049-b3ff-4215-8807-a0b0bc95510b',
    username: 'grant_operations_admin@t.gov.uk',
    password: 'pass',
    name: 'Test Grant Operations Admin',
    roles: ['FCP.GrantOperationsAdmin']
  },
  {
    id: '1e564a98-d15d-4be3-acc6-e6dd38b0b8b1',
    username: 'grant_admin@t.gov.uk',
    password: 'pass',
    name: 'Test Grant Applications & Operations Admin',
    roles: ['FCP.GrantApplicationsAdmin', 'FCP.GrantOperationsAdmin']
  }
]
