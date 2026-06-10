import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/$id/redirect-plugin-register')({
  GET: ({ request }) => {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/cadastro',
      },
    })
  },
})
