import { SignInForm } from "@/components/globals/forms";
import { GeneralShell } from "@/components/globals/layouts";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your account",
};

export default function Page() {
    return (
        <GeneralShell>
            <Card>
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                        Sign in to your existing account
                    </CardDescription>
                </CardHeader>

                <SignInForm />
            </Card>
        </GeneralShell>
    );
}
