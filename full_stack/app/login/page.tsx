"use client"

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Card, CardTitle, CardHeader, CardFooter, CardContent, CardAction, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form'
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'

const page = () => {
    const router = useRouter()
    const { status } = useSession()
    const { register, handleSubmit, formState: { errors } } = useForm()
    useEffect(() => {
        if (status === `authenticated`) {
            router.replace(`/dashboard`)
        }
    }, [status])
    const onSubmit = async (formData: any) => {
        const res = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false
        })
        if (!res || res.error) {
            toast.error(`Invalid email or password`)
            return
        }
        toast.success(`Login Successfully`)
        router.push(`/dashboard`)
    }

    return (
        <div className='flex flex-col min-h-screen items-center justify-center gap-6 bg-linear-to-br from-gray-50 to-gray-200'>
            <h1 className='text-3xl font-bold tracking-tight'>Welcome Back 👋</h1>
            <p className='text-sm text-muted-foreground'>Login to continue to your dashboard</p>
            <Card className='w-full max-w-sm shadow-xl border-0 rounded-2xl'>
                <CardHeader>
                    <CardTitle className='text-xl'>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                    <CardAction>
                        <Link href={`/register`}>
                            <Button variant={`link`} className='p-0 cursor-pointer'>Sign Up</Button>
                        </Link>
                    </CardAction>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <div className='flex flex-col gap-6'>
                            <div className='grid gap-2'>
                                <Label htmlFor='email'>Email</Label>
                                <Input type='email' placeholder='abc@example.com' className='h-10' {...register("email", { required: true })} />
                                {errors.email && <p className='text-sm text-red-500'>Email is required</p>}
                            </div>
                            <div className='grid gap-2'>
                                <div className='flex items-center'>
                                    <Label htmlFor='password'>Password</Label>
                                    <a href="#" className='ml-auto text-sm underline-offset-4 hover:underline'>Forgot your password?</a>
                                </div>
                                <div>
                                    <Input type='password' className='h-10' {...register("password", { required: true })} />
                                    {errors.password && <p className='text-sm text-red-500'>Password is required</p>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className='flex-col mt-5'>
                        <Button type='submit' className='w-full h-10 text-base font-medium cursor-pointer'>Login</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default page
