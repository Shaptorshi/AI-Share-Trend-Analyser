import { z } from 'zod'

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerValidate = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().regex(passwordRegex,`Password must be strong`)
})

export const loginValidate = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})
