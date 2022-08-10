import React from "react";
import { AnchorProvider, Program } from "@project-serum/anchor";

type OnboardOptionProps = {
    setDisplayType: (displayType: string) => void;
    program: Program;
    provider: AnchorProvider;
};

function OnboardProject(props: OnboardOptionProps) {
    return <div>OnboardProject</div>;
}

export default OnboardProject;
