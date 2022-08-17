import { AnchorProvider, Program, utils, web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getTruncatedPubkey } from "../../utils";

import "./ProjectWhitelist.css";

type ProjectWhitelistProps = {
    projectPda: PublicKey;
    program: Program;
    provider: AnchorProvider;
    setDisplayType: (displayType: string) => void;
};

function ProjectWhitelist({
    projectPda,
    program,
    provider,
    setDisplayType,
}: ProjectWhitelistProps) {
    const [notApplied, setNotApplied] = useState([]);
    const [whitelistedBy, setWhitelistedBy] = useState([]);
    const [notWhitelistedBy, setNotWhitelistedBy] = useState([]);

    const { publicKey } = useWallet();

    const handleApplyWhitelist = async (dao: PublicKey) => {
        try {
            const [projectWl, _wlBump] =
                await web3.PublicKey.findProgramAddress(
                    [
                        utils.bytes.utf8.encode("whitelist"),
                        dao.toBuffer(),
                        projectPda.toBuffer(),
                    ],
                    program.programId
                );

            await program.methods
                .initWhitelistProject()
                .accounts({
                    projectWhitelist: projectWl,
                    dao: dao,
                    project: projectPda,
                    authority: publicKey as PublicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([])
                .rpc();

            const projectWhitelist =
                await program.account.projectWhitelist.fetch(projectWl);

            console.log(projectWhitelist);

            window.location.reload();
        } catch (e) {
            throw new Error(`Error while applying for project whitelist: ${e}`);
        }
    };

    const callFn = async () => {
        const notApplied: any = [];
        const applied: any = [];
        const notWhitelisted: any = [];
        const whitelisted: any = [];

        const daos = await program.account.dao.all();

        const projectWhitelists = await program.account.projectWhitelist.all([
            {
                memcmp: {
                    offset: 8 + 32,
                    bytes: projectPda.toBase58(),
                },
            },
        ]);

        daos.map((dao) => {
            let flag: string = "not_applied";
            projectWhitelists.map((whitelist) => {
                if (
                    (whitelist.account.dao as any).toBase58() ===
                    dao.publicKey.toBase58()
                ) {
                    flag = "not_whitelisted";
                    if (whitelist.account.isWhitelisted) {
                        flag = "is_whitelisted";
                    }
                }
            });
            flag === "is_whitelisted"
                ? whitelisted.push(dao)
                : flag === "not_whitelisted"
                ? notWhitelisted.push(dao)
                : notApplied.push(dao);
        });

        console.log("notApplied", notApplied);
        setNotApplied(notApplied);

        console.log("whitelisted", whitelisted);
        setWhitelistedBy(whitelisted);

        console.log("notWhitelisted", notWhitelisted);
        setNotWhitelistedBy(notWhitelisted);
    };

    useEffect(() => {
        callFn();
    }, []);

    return (
        <div className="projectwl__cont">
            {/* <div className="arrowback">
                <ArrowBackIcon
                    onClick={() => {
                        setDisplayType("is_project");
                    }}
                    style={{ cursor: "pointer" }}
                />
            </div> */}
            {whitelistedBy && whitelistedBy.length !== 0 && (
                <div className="projectwl__wltedcont">
                    <div className="projectwlted__head">
                        Already Whitelisted
                    </div>
                    <div className="projectwlted__daocont">
                        {whitelistedBy.map((dao: any) => (
                            <div className="projectwlted__dao">
                                <span className="wlteddao_name">
                                    {dao.account.name}
                                </span>
                                <span className="wlteddao_pubkey">
                                    {getTruncatedPubkey(
                                        dao.publicKey.toBase58()
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {notWhitelistedBy.length !== 0 && (
                <div className="projectwl__notwlcont">
                    <div className="projectnotwlted__head">
                        Waiting for Whitelist Approval
                    </div>
                    <div className="projectnotwlted__daocont">
                        {notWhitelistedBy.map((dao: any) => (
                            <div className="projectnotwlted__dao">
                                <span className="notwlteddao_name">
                                    {dao.account.name}
                                </span>
                                <span className="notwlteddao_pubkey">
                                    {getTruncatedPubkey(
                                        dao.publicKey.toBase58()
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {notApplied.length !== 0 && (
                <div className="projectwl__notapcont">
                    <div className="projectnotap__head">
                        Apply to Get Whitelisted
                    </div>
                    <div className="projectnotap__daocont">
                        {notApplied.map((dao: any) => (
                            <div className="projectnotap__dao">
                                <div className="projectnotap__daodeets">
                                    <span className="notapdao_name">
                                        {dao.account.name}
                                    </span>
                                    <span className="notapdao_pubkey">
                                        {getTruncatedPubkey(
                                            dao.publicKey.toBase58()
                                        )}
                                    </span>
                                </div>
                                <button
                                    className="projectnotap__applybtn"
                                    onClick={() => {
                                        handleApplyWhitelist(dao.publicKey);
                                    }}
                                >
                                    Apply for Whitelist
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectWhitelist;
