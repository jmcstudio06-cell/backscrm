import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute('/api/urls/update')({
  GET: ({ request }) => {
    return json({
      success: true,
      urls: {
        register: 'https://backscrm.onrender.com/cadastro',
        login: 'https://backscrm.onrender.com/login',
        panel: 'https://backscrm.onrender.com/dashboard'
      }
    })
  },
})
