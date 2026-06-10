import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/services/update')({
  GET: () => {
    return json({ success: true, status: 'updated' })
  },
})
