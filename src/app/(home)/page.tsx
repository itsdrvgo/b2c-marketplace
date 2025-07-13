import { GeneralShell } from "@/components/globals/layouts";
import { Landing, Showcase } from "@/components/home";

export default function Page() {
    return (
        <>
            <Landing />
            <GeneralShell
                classNames={{
                    mainWrapper: "mt-20",
                    innerWrapper: "xl:max-w-[100rem]",
                }}
            >
                <Showcase />
            </GeneralShell>
        </>
    );
}
