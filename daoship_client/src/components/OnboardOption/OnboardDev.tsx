import React from "react";
import { AnchorProvider, Program } from "@project-serum/anchor";

type OnboardOptionProps = {
    setDisplayType: (displayType: string) => void;
    program: Program;
    provider: AnchorProvider;
};

function OnboardDev(props: OnboardOptionProps) {
    return <div>OnboardDev</div>;
}

export default OnboardDev;
