import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials:any) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email }
                })

                if (!user) return null

                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        })
    ],
    session: {
        strategy: "jwt" as const
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                (session.user as any).id = token.id
            }
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }