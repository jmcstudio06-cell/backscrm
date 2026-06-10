import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

const adminAccount = {
  email: 'mariooliveira.ctt@gmail.com',
  password: 'M@eeuteamo1',
  userData: {
    id: "777",
    name: "Mário Oliveira",
    email: "mariooliveira.ctt@gmail.com",
    role: "admin" as const,
    premium: true,
    status: "active" as const,
    createdAt: new Date().toISOString()
  }
}

export const APIRoute = createAPIFileRoute('/api/auth/login')({
  POST: async ({ request }) => {
    console.log('[API LOGIN] Rota /api/auth/login chamada com sucesso!')
    try {
      const body = await request.json()
      console.log('[API LOGIN] Dados recebidos:', body)
      const { email, password } = body || {}
      
      if (!email || !password) {
        return json({ error: "E-mail e senha são obrigatórios" }, { status: 400 })
      }

      if (email === adminAccount.email && password === adminAccount.password) {
        console.log('[API LOGIN] ADMINISTRADOR AUTORIZADO!')
        return json({
          token: "admin-master-token-" + Date.now(),
          user: adminAccount.userData
        })
      }

      return json({
        token: "token-usuario-" + Date.now(),
        user: {
          id: "1",
          name: "Usuário Comum",
          email: email,
          role: "user" as const,
          premium: true,
          status: "active" as const,
          createdAt: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('[API LOGIN] ERRO:', error)
      return json({ error: "Falha interna do servidor" }, { status: 500 })
    }
  },
})