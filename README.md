# fg-entra-stub-frontend

Entra ID stub service providing OAuth 2.0/OIDC endpoints for testing and development.

- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Available Endpoints](available-endpoints)
- [Docker](#docker)
- [License](#license)

## Requirements

- nvm
- [Node.js](http://nodejs.org/)

## Quick Start

Use supported version of Node:

```
nvm use
```

Install dependencies:

```bash
npm install
```

Run:

```bash
npm run dev
```

## Clients and Accounts

Clients and users are defined in the codebase:

- [src/server/common/clients.js](src/server/common/clients.js)
- [src/server/common/users.js](src/server/common/users.js)

## Public / Private Keys

Keys used to sign and verify tokens are defined in the codebase:

- [src/server/common/keys.js](src/server/common/keys.js)

## Endpoints

- `GET/POST /authorize` - OAuth 2.0 authorization endpoint
- `POST /token` - Token exchange endpoint
- `GET /jwks` - JSON Web Key Set endpoint
- `POST /sign` - Token signing endpoint

## Docker

### Development

```bash
docker build --target development --tag fg-entra-stub-frontend:dev .
docker run -p 3010:3010 fg-entra-stub-frontend:dev
```

### Production

```bash
docker build --tag fg-entra-stub-frontend .
docker run -p 3010:3010 fg-entra-stub-frontend
```

### With Docker Compose

```bash
docker compose up --build -d
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
