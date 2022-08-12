import React, { useEffect, useState } from "react";
import {
    Program,
    AnchorProvider,
    Address,
    web3,
    utils,
} from "@project-serum/anchor";
import NotRegistered from "../NotRegistered/NotRegistered";
import OnboardOption from "../OnboardOption/OnboardOption";
import { useWallet } from "@solana/wallet-adapter-react";
import DaoDashboard from "../DaoDashboard/DaoDashboard";
import ProjectDashboard from "../ProjectDashboard/ProjectDashboard";
import UserDashboard from "../UserDashboard/UserDashboard";

type ConnectedProps = {
    program: Program;
    provider: AnchorProvider;
};

function Connected({ program, provider }: ConnectedProps) {
    const [displayType, setDisplayType] = useState("");
    const [payload, setPayload] = useState<any>();

    const wallet = useWallet();

    const findWalletType = async () => {
        try {
            console.log(wallet.publicKey?.toBase58());
            try {
                const [daoPDA, _daoBump] =
                    await web3.PublicKey.findProgramAddress(
                        [
                            utils.bytes.utf8.encode("dao"),
                            wallet.publicKey?.toBuffer() as Buffer,
                        ],
                        program.programId
                    );

                const dao = await program.account.dao.fetch(daoPDA);
                console.log(dao);
                setPayload(dao);
                setDisplayType("is_dao");
            } catch (e) {
                try {
                    const [projectPDA, _projectBump] =
                        await web3.PublicKey.findProgramAddress(
                            [
                                utils.bytes.utf8.encode("project"),
                                wallet.publicKey?.toBuffer() as Buffer,
                            ],
                            program.programId
                        );

                    const project = await program.account.project.fetch(
                        projectPDA
                    );

                    setPayload(project);
                    console.log(project);
                    setDisplayType("is_project");
                } catch (e) {
                    try {
                        const [userPDA, _userBump] =
                            await web3.PublicKey.findProgramAddress(
                                [
                                    utils.bytes.utf8.encode("user"),
                                    wallet.publicKey?.toBuffer() as Buffer,
                                ],
                                program.programId
                            );

                        const user = await program.account.user.fetch(userPDA);

                        setPayload(user);
                        console.log(user);
                        setDisplayType("is_user");
                    } catch (e) {
                        setDisplayType("not_registered");
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        findWalletType();
    }, []);

    return (
        <div>
            {displayType === "not_registered" && (
                <NotRegistered setDisplayType={setDisplayType} />
            )}
            {displayType === "onboarding" && (
                <OnboardOption
                    setDisplayType={setDisplayType}
                    program={program}
                    provider={provider}
                />
            )}
            {displayType === "is_dao" && (
                <DaoDashboard
                    payload={payload}
                    program={program}
                    provider={provider}
                />
            )}
            {displayType === "is_project" && (
                <ProjectDashboard
                    payload={payload}
                    program={program}
                    provider={provider}
                />
            )}
            {displayType === "is_user" && (
                <UserDashboard
                    payload={payload}
                    program={program}
                    provider={provider}
                />
            )}
        </div>
    );
}

export default Connected;
