import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/auth/register')({
  POST: async ({ request }) => {
    const body = await request.json()
    const { email } = body || {}
    
    // Mock de registro para desenvolvimento/teste
    return json({
      success: true,
      token: "token-registro-dev",
      user: { 
        id: Date.now(), 
        name: email?.split('@')[0] || "Novo Usuário", 
        email: email || "user@example.com", 
        role: "user",
        premium: false, 
        status: "active" 
      }
    })
  },
})
