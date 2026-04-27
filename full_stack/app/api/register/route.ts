import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { registerValidate } from '../validation/validate'

export async function POST(req: Request) {
    const body = await req.json()
    const {confirmPassword,...cleanBody} = body
    const parsed = registerValidate.safeParse(cleanBody)

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const existedUser = await prisma.user.findUnique({ where: { email } })

    if (existedUser) {
        return Response.json({ message: `User exists already` }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: {
            name, email, password: hashedPassword
        }
    })

    return Response.json({ message: `User created successfully`,user })
}