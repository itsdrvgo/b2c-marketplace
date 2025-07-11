"use client";

import { ERROR_MESSAGES } from "@/config/const";
import { siteConfig } from "@/config/site";
import {
    useAuth as useClerkAuth,
    useSignIn as useClerkSignIn,
    useSignUp as useClerkSignUp,
} from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { axios } from "../axios";
import { handleClientError, wait } from "../utils";
import { CachedUser, ResponseData, SignIn, SignUp } from "../validations";

export function useAuth() {
    const router = useRouter();

    const { isLoaded: isSignUpLoaded, signUp } = useClerkSignUp();
    const { isLoaded: isSignInLoaded, signIn, setActive } = useClerkSignIn();

    const useCurrentUser = ({
        initialData,
    }: { initialData?: CachedUser } = {}) => {
        return useQuery({
            queryKey: ["user", "me"],
            queryFn: async () => {
                const response =
                    await axios.get<ResponseData<CachedUser>>("/users/me");
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                if (!response.data.data)
                    throw new Error(ERROR_MESSAGES.NOT_FOUND);
                return response.data.data;
            },
            initialData,
        });
    };

    const useSignUp = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Creating your account...");
                return { toastId };
            },
            mutationFn: async (values: SignUp) => {
                if (!isSignUpLoaded) throw new Error(ERROR_MESSAGES.GENERIC);

                await signUp.create({
                    emailAddress: values.email,
                    password: values.password,
                    firstName: values.firstName,
                    lastName: values.lastName,
                });

                await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                });
            },
            onSuccess: (_, __, { toastId }) => {
                toast.success("Account created, please verify your email", {
                    id: toastId,
                });
                router.push("/auth/verify");
            },
            onError: (err, __, ctx) => {
                return isClerkAPIResponseError(err)
                    ? toast.error(err.errors.map((e) => e.message).join(", "), {
                          id: ctx?.toastId,
                      })
                    : handleClientError(err, ctx?.toastId);
            },
        });
    };

    const useSignIn = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Signing in...");
                return { toastId };
            },
            mutationFn: async (values: SignIn) => {
                if (!isSignInLoaded) throw new Error(ERROR_MESSAGES.GENERIC);

                const signInAttempt = await signIn.create({
                    identifier: values.email,
                    password: values.password,
                });

                if (signInAttempt.status !== "complete")
                    throw new Error(
                        "Missing requirements or verification aborted"
                    );

                return { signInAttempt };
            },
            onSuccess: async ({ signInAttempt }, _, { toastId }) => {
                await setActive?.({
                    session: signInAttempt.createdSessionId,
                });
                toast.success("Welcome back!", {
                    id: toastId,
                });
                router.push("/");
            },
            onError: (err, __, ctx) => {
                return isClerkAPIResponseError(err)
                    ? toast.error(err.errors.map((e) => e.message).join(", "), {
                          id: ctx?.toastId,
                      })
                    : handleClientError(err, ctx?.toastId);
            },
        });
    };

    const useEmailVerify = () => {
        const { isLoaded, signUp, setActive } = useClerkSignUp();

        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Verifying your email...");
                return { toastId };
            },
            mutationFn: async (values: { otp: string }) => {
                if (!isLoaded) throw new Error(ERROR_MESSAGES.GENERIC);

                const signUpAttempt =
                    await signUp.attemptEmailAddressVerification({
                        code: values.otp,
                    });

                if (signUpAttempt.status !== "complete")
                    throw new Error(
                        "Missing requirements or verification aborted"
                    );

                return { signUpAttempt };
            },
            onSuccess: async ({ signUpAttempt }, _, { toastId }) => {
                await setActive?.({
                    session: signUpAttempt.createdSessionId,
                });
                toast.success(
                    `Hey ${signUpAttempt.firstName}, Welcome to ${siteConfig.name}!`,
                    { id: toastId }
                );
                router.push("/");
            },
            onError: (err, __, ctx) => {
                return isClerkAPIResponseError(err)
                    ? toast.error(err.errors.map((e) => e.message).join(", "), {
                          id: ctx?.toastId,
                      })
                    : handleClientError(err, ctx?.toastId);
            },
        });
    };

    const useLogout = () => {
        const { signOut } = useClerkAuth();

        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Signing out...");
                return { toastId };
            },
            mutationFn: async () => {
                await signOut({
                    redirectUrl: "/",
                });
            },
            onSuccess: async (_, __, { toastId }) => {
                toast.success("See you soon!", { id: toastId });
                await wait(500);
                window.location.reload();
            },
            onError: (err, __, ctx) => {
                return isClerkAPIResponseError(err)
                    ? toast.error(err.errors.map((e) => e.message).join(", "), {
                          id: ctx?.toastId,
                      })
                    : handleClientError(err, ctx?.toastId);
            },
        });
    };

    return {
        useCurrentUser,
        useSignUp,
        useSignIn,
        useEmailVerify,
        useLogout,
    };
}
