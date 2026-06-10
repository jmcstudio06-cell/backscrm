import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/urls/install/$id')({
  GET: ({ params }) => {
    return json({ success: true, url: 'https://backscrm.onrender.com' })
  },
})
