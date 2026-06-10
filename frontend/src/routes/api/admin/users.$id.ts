import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

// Em um cenário real, isso estaria em um banco de dados
// Aqui estamos apenas simulando a lógica de atualização
export const APIRoute = createAPIFileRoute('/api/admin/users/$id')({
  PATCH: async ({ request, params }) => {
    const { id } = params
    const patch = await request.json()
    
    return json({ 
      success: true, 
      message: `Usuário ${id} atualizado com sucesso`,
      updated: patch 
    })
  },
  DELETE: ({ params }) => {
    const { id } = params
    return json({ 
      success: true, 
      message: `Usuário ${id} removido com sucesso` 
    })
  }
})
