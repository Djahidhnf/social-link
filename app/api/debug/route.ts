export async function GET() {
  return Response.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "missing",
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
    NODE_ENV: process.env.NODE_ENV,
  })
}