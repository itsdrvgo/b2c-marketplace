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
import { SignIn, signInSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

export function SignInForm() {
    const form = useForm<SignIn>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { useSignIn } = useAuth();
    const { mutateAsync, isPending } = useSignIn();

    const onSubmit = async (values: SignIn) => {
        await mutateAsync(values);
        form.reset();
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
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
                </CardContent>

                <CardFooter className="flex-col items-end gap-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        Sign In
                    </Button>

                    <div className="space-y-1 text-end">
                        <p className="text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/auth/signup"
                                className="text-accent underline underline-offset-2"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </form>
        </Form>
    );
}
