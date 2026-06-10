import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/api/urls/install/$id')({
  GET: ({ params }) => {
    return json({ success: true, url: 'https://backscrm.onrender.com' })
  },
})
