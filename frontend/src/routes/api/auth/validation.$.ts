import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/api/auth/validation/$')({
  GET: () => {
    return json({ success: true, status: "authorized" })
  },
  POST: () => {
    return json({ success: true, status: "authorized" })
  },
})
