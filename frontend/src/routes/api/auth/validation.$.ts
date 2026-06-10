import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/auth/validation/$')({
  GET: () => {
    return json({ success: true, status: "authorized" })
  },
  POST: () => {
    return json({ success: true, status: "authorized" })
  },
})
