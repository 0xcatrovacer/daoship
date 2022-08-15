import { Program, web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import { getTruncatedPubkey } from "../../utils";

import "./DaoWhitelistApplications.css";

type WhitelistApplicationProps = {
    program: Program;
    daoPda: PublicKey;
};

function DaoWhitelistApplications({
    program,
    daoPda,
}: WhitelistApplicationProps) {
    const [whitelistProjects, setWhitelistProjects] = useState<any>();

    const { publicKey } = useWallet();

    const handleWhitelist = async (
        projectWhitelist: PublicKey,
        project: PublicKey
    ) => {
        await program.methods
            .whitelistProject()
            .accounts({
                projectWhitelist: projectWhitelist,
                dao: daoPda,
                project: project,
                authority: publicKey as PublicKey,
            })
            .signers([])
            .rpc();

        const whitelistedProject = await program.account.projectWhitelist.fetch(
            projectWhitelist
        );

        console.log(whitelistedProject);
        window.location.reload();
    };

    const callFn = async () => {
        const applicationProjects: any = [];
        const projectWhitelists = await program.account.projectWhitelist.all([
            {
                memcmp: {
                    offset: 8,
                    bytes: daoPda.toBase58(),
                },
            },
        ]);

        projectWhitelists.map(async (wl) => {
            console.log(wl);
            const projData = await program.account.project.fetch(
                wl.account.project as PublicKey
            );

            console.log(projData);

            wl.account.isWhitelisted === false &&
                applicationProjects.push({
                    projData,
                    projectPubkey: wl.account.project,
                    wlPubkey: wl.publicKey,
                });
        });

        setTimeout(() => {
            console.log("applicationProjects", applicationProjects);
            setWhitelistProjects(applicationProjects);
        }, 200);
    };

    useEffect(() => {
        callFn();
    }, []);

    return (
        <div className="whitelistapp__cont">
            <div className="whitelistapp__head">Whitelist Applications</div>
            <div className="whitelistapp__projectcont">
                {whitelistProjects &&
                    whitelistProjects.map((project: any) => (
                        <div className="whitelistapp__project">
                            <div className="whitelistapp__projdeets">
                                <span className="whitelistapp__projname">
                                    {project.projData.name}
                                </span>
                                <span className="whitelistapp__projpubkey">
                                    {getTruncatedPubkey(
                                        project.projectPubkey.toBase58()
                                    )}
                                </span>
                            </div>
                            <button
                                className="whitelistapp__wlbutton"
                                onClick={() =>
                                    handleWhitelist(
                                        project.wlPubkey,
                                        project.projectPubkey
                                    )
                                }
                            >
                                Whitelist
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default DaoWhitelistApplications;
