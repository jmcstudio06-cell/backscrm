import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$')({
  beforeLoad: ({ location }) => {
    const path = location.pathname.toLowerCase()

    if (path.includes('redirect-plugin-register')) {
      throw redirect({
        to: '/cadastro',
      })
    }

    if (path.includes('redirect-plugin-panel')) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
})
