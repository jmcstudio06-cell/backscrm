import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

interface User {
  id: string
  email: string
  name?: string
  plan?: 'mensal' | 'trimestral' | 'anual' | null
  status?: 'active' | 'trial' | 'expired'
  expiresAt?: string
  createdAt?: string
}

let mockUsers: User[] = [
  {
    id: '1',
    email: 'cliente1@exemplo.com',
    name: 'Cliente 1',
    plan: 'mensal',
    status: 'active',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    email: 'cliente2@exemplo.com',
    name: 'Cliente 2',
    plan: 'anual',
    status: 'active',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    email: 'cliente3@exemplo.com',
    name: 'Cliente 3',
    plan: null,
    status: 'trial',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const APIRoute = createAPIFileRoute('/api/admin/users')({
  GET: ({ request }) => {
    return json(mockUsers)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const newUser: User = {
      id: Date.now().toString(),
      email: body.email,
      name: body.name,
      plan: body.plan || null,
      status: body.status || 'trial',
      expiresAt: body.expiresAt,
      createdAt: new Date().toISOString()
    }
    mockUsers.push(newUser)
    return json(newUser)
  }
})
