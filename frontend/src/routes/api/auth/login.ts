import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/auth/login')({
  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const { email, password } = body || {}
      
      console.log(`Tentativa de login: ${email}`)

      // Resposta padrão de admin se for o seu email
      if (email === 'mariooliveira.ctt@gmail.com' && password === 'M@eeuteamo1') {
        const adminData = {
          token: "admin-master-token-" + Date.now(),
          user: { 
            id: "777", 
            name: "Mário Oliveira", 
            email: email, 
            role: "admin", 
            premium: true, 
            status: "active" 
          }
        }
        return new Response(JSON.stringify(adminData), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Resposta para usuários comuns
      const userData = {
        token: "token-user-" + Date.now(),
        user: { 
          id: "1", 
          name: "Usuário", 
          email: email || "user@backscrm.com.br", 
          role: "user", 
          premium: true, 
          status: "active" 
        }
      }
      return new Response(JSON.stringify(userData), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: "Erro ao processar login" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  },
})
