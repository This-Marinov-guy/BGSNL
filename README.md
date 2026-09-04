# BGSNL website

Next.js 16 App Router frontend for Bulgarian Society Netherlands.

## Local development

Use Node.js 20 and install dependencies:

```bash
npm install
```

Start `BGSNL-API` first. Its development script listens on port 8080. Then
start this project:

```bash
npm run dev
```

The site is available at <http://localhost:3000>.

The frontend environment must define both API URLs:

```env
NEXT_PUBLIC_SERVER_URL=https://your-production-api.example/api/
NEXT_PUBLIC_TEST_SERVER_URL=http://localhost:8080/api/
```

Public pages fetch through `NEXT_PUBLIC_TEST_SERVER_URL` during local server
rendering and through `NEXT_PUBLIC_SERVER_URL` in production. Browser requests
follow the same rule.

For authenticated server-to-server SSR requests, set this server-only value:

```env
BGSNL_SERVER_KEY=the-same-value-as-the-api-SSR_SERVER_KEY
```

Do not add a `NEXT_PUBLIC_` prefix to that key.

PrimeReact 11 also requires a PrimeUI license key. Add the Community or
Commercial key issued for the deployment:

```env
NEXT_PUBLIC_PRIMEUI_LICENSE=your-primeui-license-key
```

## Production check

```bash
npm run build
npm start
```
