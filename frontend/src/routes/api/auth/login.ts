import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/auth/login')({
  POST: async ({ request }) => {
    const body = await request.json()
    const { email, password } = body || {}
    
    // Verificação de Admin Especial
    if (email === 'mariooliveira.ctt@gmail.com' && password === 'M@eeuteamo1') {
      console.log('Admin login detectado!');
      return json({
        token: "admin-master-token",
        user: { 
          id: "777", 
          name: "Mário Oliveira", 
          email: email, 
          role: "admin", 
          premium: true, 
          status: "active" 
        }
      })
    }

    return json({
      token: "token-extensao-dev",
      user: { 
        id: "1", 
        name: "Usuário Comum", 
        email: email || "user@backscrm.com.br", 
        role: "user", 
        premium: true, 
        status: "active" 
      }
    })
  },
})
