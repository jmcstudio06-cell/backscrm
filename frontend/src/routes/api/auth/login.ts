import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/auth/login')({
  POST: async ({ request }) => {
    const body = await request.json()
    const { email } = body || {}
    return json({
      success: true,
      token: "token-extensao-dev",
      user: { id: 1, name: "Admin", email: email || "admin@backscrm.com.br", premium: true, status: "active" }
    })
  },
})
