import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

// Mock de dados de usuários para o painel admin
let mockUsers = [
  { 
    id: '1', 
    email: 'cliente1@exemplo.com', 
    plan: 'mensal', 
    status: 'active', 
    expiresAt: '2026-07-10T00:00:00.000Z', 
    createdAt: '2026-06-10T00:00:00.000Z' 
  },
  { 
    id: '2', 
    email: 'teste@exemplo.com', 
    plan: null, 
    status: 'trial', 
    expiresAt: '2026-06-17T00:00:00.000Z', 
    createdAt: '2026-06-10T00:00:00.000Z' 
  },
  { 
    id: '3', 
    email: 'antigo@exemplo.com', 
    plan: 'anual', 
    status: 'expired', 
    expiresAt: '2026-06-01T00:00:00.000Z', 
    createdAt: '2025-06-01T00:00:00.000Z' 
  }
];

export const APIRoute = createAPIFileRoute('/api/admin/users')({
  GET: ({ request }) => {
    // Verificação básica de admin via token no header (opcional para mock)
    const auth = request.headers.get('Authorization')
    return json({ users: mockUsers })
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      createdAt: new Date().toISOString()
    }
    mockUsers.push(newUser)
    return json(newUser)
  }
})
