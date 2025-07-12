import { GeneralShell } from "@/components/globals/layouts";
import { Landing, Showcase } from "@/components/home";

export default function Page() {
    return (
        <>
            <Landing />
            <GeneralShell>
                <Showcase />
            </GeneralShell>
        </>
    );
}
