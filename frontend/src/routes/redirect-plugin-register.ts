import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/redirect-plugin-register')({
  GET: ({ request }) => {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/cadastro',
      },
    })
  },
})
