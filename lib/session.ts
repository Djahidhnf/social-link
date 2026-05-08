import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function getSession(req: NextRequest) {
  return await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })
}