import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/$')({
  GET: ({ request, params }) => {
    const url = new URL(request.url)
    const path = url.pathname

    if (path.includes('redirect-plugin-register')) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/cadastro' },
      })
    }

    if (path.includes('redirect-plugin-panel')) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/dashboard' },
      })
    }

    // Se não for uma rota de redirecionamento, deixa o roteador do frontend lidar (ou dar 404)
    return new Response('Not Found', { status: 404 })
  },
})
