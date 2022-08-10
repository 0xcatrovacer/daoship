import { Program, AnchorProvider } from "@project-serum/anchor";
import { useState } from "react";
import OnboardDao from "./OnboardDao";
import OnboardDev from "./OnboardDev";
import OnboardMain from "./OnboardMain";
import "./OnboardOption.css";
import OnboardProject from "./OnboardProject";

type OnboardOptionProps = {
    setDisplayType: (displayType: string) => void;
    program: Program;
    provider: AnchorProvider;
};

function OnboardOption({
    setDisplayType,
    program,
    provider,
}: OnboardOptionProps) {
    const [onboardType, setOnboardType] = useState("onboard_main");

    return (
        <span>
            {onboardType === "onboard_main" && (
                <OnboardMain setOnboardType={setOnboardType} />
            )}
            {onboardType === "onboard_dao" && (
                <OnboardDao
                    setDisplayType={setDisplayType}
                    program={program}
                    provider={provider}
                />
            )}
            {onboardType === "onboard_project" && (
                <OnboardProject
                    setDisplayType={setDisplayType}
                    program={program}
                    provider={provider}
                />
            )}
            {onboardType === "onboard_developer" && (
                <OnboardDev
                    setDisplayType={setDisplayType}
                    program={program}
                    provider={provider}
                />
            )}
        </span>
    );
}

export default OnboardOption;
