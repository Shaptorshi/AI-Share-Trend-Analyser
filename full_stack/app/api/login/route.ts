import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt'
import { loginValidate } from '../validation/validate'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = loginValidate.safeParse(body)

        if (!parsed.success) {
            return Response.json({ message: parsed.error.issues[0].message }, { status: 400 })
        }

        const { email, password } = parsed.data
        const existedUser = await prisma.user.findUnique({ where: { email } })

        if (!existedUser) {
            return Response.json({ message: `Account not found or the email is not registered` }, { status: 400 })
        }

        const passwordCheck = await bcrypt.compare(password,existedUser.password)

        if (!passwordCheck) {
            return Response.json({ message: `Invalid Password` }, { status: 400 })
        }

        return Response.json({
            message: `User logged in`,
            user: {
                name:existedUser.name,
                id: existedUser.id,
                email: existedUser.email,
            }
        })
    } catch (error) {
        Response.json({ message: `Error: ${error}` }, { status: 500 })
    }
}