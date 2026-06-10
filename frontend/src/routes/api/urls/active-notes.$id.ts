import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/api/urls/active-notes/$id')({
  GET: ({ params }) => {
    return json({ success: true, path_note_update: { redirect: false } })
  },
})
