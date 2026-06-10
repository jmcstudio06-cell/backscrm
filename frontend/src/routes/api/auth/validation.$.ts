import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/auth/validation/$')({
  GET: ({ request }) => {
    return new Response(JSON.stringify({ success: true, status: "authorized" }), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
})
