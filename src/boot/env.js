import { defineBoot } from '#q-app/wrappers'

const REQUIRED = ['GQL_API', 'REST_API']

export default defineBoot(() => {
  const missing = REQUIRED.filter((name) => !process.env[name])
  if (missing.length) {
    const message = `Missing required env variables: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`
    if (process.env.DEV) {
      throw new Error(message)
    }
    console.error(message)
  }
})
