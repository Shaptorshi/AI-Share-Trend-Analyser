"use client"

import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardTitle, CardHeader, CardFooter, CardContent, CardAction, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const page = () => {
    const router = useRouter()
    const { register, handleSubmit, watch, formState: { errors } } = useForm()

    const onSubmit = async (formData: any) => {
        const response = await fetch(`/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })

        if (!response.ok) {
            toast.error(`User already exists`)
            return
        }

        toast.success(`Account Created Successfully`)
        router.push(`/login`)
        // await signIn("credentials", {
        //     email: formData.email,
        //     password: formData.password,
        //     redirect: true,
        //     callbackUrl: "/dashboard"
        // })
    }
    return (
        <div className='flex flex-col items-center justify-center min-h-screen gap-6 bg-linear-to-br from-gray-50 to-gray-200'>
            <h1 className='font-bold text-3xl tracking-tight'>Create your account</h1>
            <Card className='w-full max-w-sm shadow-xl rounded-2xl border-0'>
                <CardHeader>
                    <CardTitle className='text-xl'>Create an account</CardTitle>
                    <CardDescription>Enter your details below to create an account and begin</CardDescription>
                    <CardAction>
                        <Link href={`/login`}>
                            <Button variant={`link`} className='cursor-pointer p-0' >Login</Button>
                        </Link>
                    </CardAction>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <div className='flex flex-col gap-6'>
                            <div className='grid gap-2'>
                                <Label>Name</Label>
                                <Input type='text' placeholder='Enter the name...' className='h-10' {...register("name", { required: `Name is required` })} />
                                {errors.name && <p className='text-sm text-red-500'>{errors.name.message as string}</p>}
                            </div>
                            <div className='grid gap-2'>
                                <Label>Email</Label>
                                <Input type='text' placeholder='abc@example.com' className='h-10' {...register("email", { required: true })} />
                                {errors.email && <p className='text-sm text-red-500'>Email is required</p>}
                            </div>
                            <div className='grid gap-2'>
                                <Label>Password</Label>
                                <Input type='password' placeholder='Enter the password...' className='h-10' {...register("password", {
                                    required: true, pattern: {
                                        value: passwordRegex, message: `Minimum 8 chars, uppercase, lowercase, number & special character`
                                    }
                                })} />
                                {errors.password && <p className='text-sm text-red-500'>{errors.password.message as string}</p>}
                            </div>
                            <div className='grid gap-2'>
                                <Label>Confirm Password</Label>
                                <Input type='password' placeholder='Confirm the password...' className='h-10' {...register("confirmPassword", { required: true, validate: (value) => value === watch("password") || `Passwords do not match` })} />
                                {errors.confirmPassword && <p className='text-sm text-red-500'>{errors.confirmPassword.message as string}</p>}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className='flex-col mt-5'>
                        <Button type='submit' className='w-full cursor-pointer text-base h-10 font-medium'>Sign Up</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default page
