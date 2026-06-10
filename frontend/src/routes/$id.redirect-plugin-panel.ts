import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/$id/redirect-plugin-panel')({
  GET: ({ request }) => {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard',
      },
    })
  },
})
