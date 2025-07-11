"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password";
import { useAuth } from "@/lib/react-query";
import { SignUp, signUpSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

export function SignUpForm() {
    const form = useForm<SignUp>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const { useSignUp } = useAuth();
    const { mutateAsync, isPending } = useSignUp();

    const onSubmit = async (data: SignUp) => {
        await mutateAsync(data);
        form.reset();
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center gap-4 md:flex-row">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>First Name</FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder="John"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Last Name</FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder="Doe"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>

                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="johndoe@gmail.com"
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col items-center gap-4 md:flex-row">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Password</FormLabel>

                                    <FormControl>
                                        <PasswordInput
                                            placeholder="********"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Confirm Password</FormLabel>

                                    <FormControl>
                                        <PasswordInput
                                            placeholder="********"
                                            disabled={isPending}
                                            showToggle={false}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex-col items-end gap-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        Create Account
                    </Button>

                    <p className="text-sm">
                        Already have an account?{" "}
                        <Link
                            href="/auth/signin"
                            className="text-accent underline underline-offset-2"
                        >
                            Login here
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Form>
    );
}
