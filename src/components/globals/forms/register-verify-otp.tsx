"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/lib/react-query";
import { OTP, otpSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export function RegisterVerifyOTPForm() {
    const form = useForm<OTP>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    const { useEmailVerify } = useAuth();
    const { mutateAsync, isPending } = useEmailVerify();

    const onSubmit = async (values: OTP) => {
        await mutateAsync(values);
        form.reset();
    };

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <InputOTP
                                        {...field}
                                        maxLength={6}
                                        disabled={isPending}
                                    >
                                        {Array.from({ length: 6 }).map(
                                            (_, i) => (
                                                <InputOTPGroup key={i}>
                                                    <InputOTPSlot
                                                        index={i}
                                                        className="h-14 w-12"
                                                    />
                                                </InputOTPGroup>
                                            )
                                        )}
                                    </InputOTP>
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        Verify OTP
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}
