import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/remote/code')({
  GET: ({ request }) => {
    return new Response('console.log("Backs ZapCRM: Remote code loaded.");', {
      headers: { 'Content-Type': 'application/javascript' },
    })
  },
})
