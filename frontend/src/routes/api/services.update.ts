import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/api/services/update')({
  GET: () => {
    return json({ success: true, status: 'updated' })
  },
})
