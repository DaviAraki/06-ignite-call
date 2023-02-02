import NextAuth from 'next-auth'

declare module 'next-auth' {
  type User = {
    id: string
    name: string
    email: string
    username: string
    avatar_url: string
  }

  interface Session {
    user: User
  }
}
