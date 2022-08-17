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
import ProjectWhitelist from "../ProjectWhitelist/ProjectWhitelist";
import DaoWhitelistApplications from "../DaoWhitelistApplications/DaoWhitelistApplications";
import ProjectBounty from "../ProjectBounty/ProjectBounty";
import DevBountyDash from "../DevBountyDash/DevBountyDash";

type ConnectedProps = {
    program: Program;
    provider: AnchorProvider;
};

function Connected({ program, provider }: ConnectedProps) {
    const [displayType, setDisplayType] = useState("");
    const [payload, setPayload] = useState<any>();
    const [daoPda, setDaoPda] = useState<any>();
    const [projectPda, setProjectPda] = useState<any>();
    const [devPda, setDevPda] = useState<any>();

    const { publicKey }: any = useWallet();

    const findWalletType = async () => {
        try {
            await publicKey;
            console.log(publicKey.toBase58());
            try {
                const [daoPDA, _daoBump] =
                    await web3.PublicKey.findProgramAddress(
                        [
                            utils.bytes.utf8.encode("dao"),
                            publicKey.toBuffer() as Buffer,
                        ],
                        program.programId
                    );

                const dao = await program.account.dao.fetch(daoPDA);
                console.log(dao);
                setPayload(dao);
                setDaoPda(daoPDA);
                setDisplayType("is_dao");
            } catch (e) {
                try {
                    const [projectPDA, _projectBump] =
                        await web3.PublicKey.findProgramAddress(
                            [
                                utils.bytes.utf8.encode("project"),
                                publicKey.toBuffer() as Buffer,
                            ],
                            program.programId
                        );

                    setProjectPda(projectPDA);

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
                                    publicKey.toBuffer() as Buffer,
                                ],
                                program.programId
                            );

                        const user = await program.account.user.fetch(userPDA);

                        setDevPda(userPDA);
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
        setTimeout(() => {
            findWalletType();
        }, 200);
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
                    setDisplayType={setDisplayType}
                    payload={payload}
                />
            )}
            {displayType === "whitelist_applications" && (
                <DaoWhitelistApplications
                    program={program}
                    daoPda={daoPda}
                    setDisplayType={setDisplayType}
                />
            )}
            {displayType === "is_project" && (
                <ProjectDashboard
                    payload={payload}
                    setDisplayType={setDisplayType}
                />
            )}
            {displayType === "is_whitelistapply" && (
                <ProjectWhitelist
                    projectPda={projectPda}
                    program={program}
                    provider={provider}
                    setDisplayType={setDisplayType}
                />
            )}
            {displayType === "create_bounty" && (
                <ProjectBounty
                    projectPda={projectPda}
                    payload={payload}
                    program={program}
                    provider={provider}
                    setDisplayType={setDisplayType}
                />
            )}
            {displayType === "is_user" && (
                <UserDashboard
                    payload={payload}
                    setDisplayType={setDisplayType}
                />
            )}
            {displayType === "dev_bounty" && (
                <DevBountyDash
                    program={program}
                    provider={provider}
                    devPda={devPda}
                    setDisplayType={setDisplayType}
                />
            )}
        </div>
    );
}

export default Connected;
