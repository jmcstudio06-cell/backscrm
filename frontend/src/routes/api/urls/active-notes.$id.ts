import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/urls/active-notes/$id')({
  GET: ({ params }) => {
    return json({ success: true, path_note_update: { redirect: false } })
  },
})
