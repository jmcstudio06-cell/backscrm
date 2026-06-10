import { createAPIFileRoute, json } from "@tanstack/react-router";

// Função de backup para simular o banco de dados (apenas para desenvolvimento)
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

export const APIRoute = createAPIFileRoute('/api/login')({
  POST: async ({ request }) => {
    console.log('[API LOGIN] Recebida requisição na rota /api/login');
    try {
      const body = await request.json()
      console.log('[API LOGIN] Dados recebidos:', body);
      const { email, password } = body || {}
      
      if (!email || !password) {
        console.log('[API LOGIN] Faltam dados');
        return json({ error: "E-mail e senha são obrigatórios" }, { status: 400 })
      }

      // Verificação rápida do admin
      if (email === adminAccount.email && password === adminAccount.password) {
        console.log('[API LOGIN] Login de ADMIN autorizado!');
        return json({
          token: "admin-master-token-" + Date.now(),
          user: adminAccount.userData
        })
      }

      // Se não for admin, retorna um usuário de teste
      console.log('[API LOGIN] Login de usuário comum');
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
      console.error('[API LOGIN] Erro:', error);
      return json({ error: "Falha interna do servidor" }, { status: 500 })
    }
  },
})