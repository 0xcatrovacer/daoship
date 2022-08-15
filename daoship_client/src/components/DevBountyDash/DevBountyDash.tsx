import {
    Address,
    AnchorProvider,
    Program,
    utils,
    web3,
} from "@project-serum/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddress,
} from "@solana/spl-token";

import "./DevBountyDash.css";
import { USDC_DECIMALS, USDC_MINT } from "../../constants";

type DevBountyProps = {
    program: Program;
    provider: AnchorProvider;
    devPda: PublicKey;
    setDisplayType: (displayType: string) => void;
};

function DevBountyDash({
    program,
    provider,
    devPda,
    setDisplayType,
}: DevBountyProps) {
    const [availableBounties, setAvailableBounties] = useState<any>([]);
    const [appliedBounties, setAppliedBounties] = useState<any>([]);
    const [approvedBounties, setApprovedBounties] = useState<any>([]);
    const [submittedBounties, setSubmittedBounties] = useState<any>([]);
    const [acceptedBounties, setAcceptedBounties] = useState<any>([]);

    const { publicKey } = useWallet();

    const handleSubmitBounty = async (bounty: any) => {
        console.log(bounty);

        const [bountyApplication, _bountyApplicationBump] =
            await web3.PublicKey.findProgramAddress(
                [
                    utils.bytes.utf8.encode("bounty-application"),
                    bounty.bounty.publicKey.toBuffer(),
                    devPda.toBuffer(),
                ],
                program.programId
            );

        await program.methods
            .submitBountyForReview("")
            .accounts({
                bountyApplication: bountyApplication,
                bounty: bounty.bounty.publicKey,
                project: bounty.bounty.account.project,
                user: devPda,
                authority: publicKey as PublicKey,
            })
            .signers([])
            .rpc();

        const application = await program.account.bountyApplication.fetch(
            bountyApplication
        );

        console.log("application", application);
        window.location.reload();
    };

    const handleApplyBounty = async (bounty: any) => {
        const [bountyApplication, _bountyApplicationBump] =
            await web3.PublicKey.findProgramAddress(
                [
                    utils.bytes.utf8.encode("bounty-application"),
                    bounty.bounty.publicKey.toBuffer(),
                    devPda.toBuffer(),
                ],
                program.programId
            );

        const devTokenAccount = await getAssociatedTokenAddress(
            new PublicKey(USDC_MINT),
            publicKey as PublicKey
        );

        const transaction = new Transaction();

        try {
            await getAccount(provider.connection, devTokenAccount);
        } catch (e) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    publicKey as PublicKey,
                    devTokenAccount,
                    publicKey as PublicKey,
                    new PublicKey(USDC_MINT)
                )
            );
        }

        await provider.sendAndConfirm(transaction);

        await program.methods
            .initBountyApplication()
            .accounts({
                bountyApplication: bountyApplication,
                bounty: bounty.bounty.publicKey,
                user: devPda,
                project: bounty.bounty.account.project,
                userTokenAccount: devTokenAccount,
                authority: publicKey as PublicKey,
                clock: web3.SYSVAR_CLOCK_PUBKEY,
                systemProgram: web3.SystemProgram.programId,
            })
            .signers([])
            .rpc();

        const createdApplication =
            await program.account.bountyApplication.fetch(bountyApplication);

        console.log(createdApplication);

        window.location.reload();
    };

    const callFn = async () => {
        const allBounties = await program.account.bounty.all();

        const bountyApplications = await program.account.bountyApplication.all([
            {
                memcmp: {
                    offset: 8 + 32 + 32,
                    bytes: devPda.toBase58(),
                },
            },
        ]);

        console.log("bountyApplications", bountyApplications);

        const addBounties: Array<any> = [];
        const applied: Array<any> = [];
        const approved: Array<any> = [];
        const submitted: Array<any> = [];
        const accepted: Array<any> = [];

        allBounties.map(async (bounty) => {
            const dao = await program.account.dao.fetch(
                bounty.account.dao as Address
            );

            const project = await program.account.project.fetch(
                bounty.account.project as Address
            );

            let flag = "available";

            bountyApplications.map(async (application: any) => {
                if (
                    application.account.bounty.toBase58() ===
                    bounty.publicKey.toBase58()
                ) {
                    flag = "applied";
                }
            });

            const application = await program.account.bountyApplication.all([
                {
                    memcmp: {
                        offset: 8,
                        bytes: bounty.publicKey.toBase58(),
                    },
                },
                {
                    memcmp: {
                        offset: 8 + 32 + 32,
                        bytes: devPda.toBase58(),
                    },
                },
            ]);

            if (bounty.account.isCompleted) {
                if (
                    JSON.stringify(application[0].account.applicationStatus) ===
                    JSON.stringify({ accepted: {} })
                ) {
                    accepted.push({
                        bounty,
                        daoName: dao.name,
                        projectName: project.name,
                        status: application[0].account.applicationStatus,
                    });
                }
            } else if (flag == "applied") {
                if (
                    JSON.stringify(application[0].account.applicationStatus) ===
                    JSON.stringify({ noUpdate: {} })
                ) {
                    applied.push({
                        bounty,
                        daoName: dao.name,
                        projectName: project.name,
                        status: application[0].account.applicationStatus,
                    });
                } else if (
                    JSON.stringify(application[0].account.applicationStatus) ===
                    JSON.stringify({ approved: {} })
                ) {
                    approved.push({
                        bounty,
                        daoName: dao.name,
                        projectName: project.name,
                        status: application[0].account.applicationStatus,
                    });
                } else if (
                    JSON.stringify(application[0].account.applicationStatus) ===
                    JSON.stringify({ submitted: {} })
                ) {
                    submitted.push({
                        bounty,
                        daoName: dao.name,
                        projectName: project.name,
                        status: application[0].account.applicationStatus,
                    });
                }
            } else if (flag === "available") {
                addBounties.push({
                    bounty,
                    daoName: dao.name,
                    projectName: project.name,
                });
            }
        });

        setTimeout(() => {
            console.log("availableBounties", addBounties);
            console.log("appliedBounties", applied);
            console.log("approvedBounties", approved);
            console.log("submittedBounties", submitted);
            console.log("acceptedBounties", accepted);
            setAvailableBounties(addBounties);
            setAppliedBounties(applied);
            setApprovedBounties(approved);
            setSubmittedBounties(submitted);
            setAcceptedBounties(accepted);
        }, 700);
    };

    useEffect(() => {
        callFn();
    }, []);

    return (
        <div className="devbountydash__cont">
            <div className="devbountydash__head">Bounty Dashboard</div>

            {appliedBounties.length +
                approvedBounties.length +
                submittedBounties.length !==
                0 && (
                <div className="devbountydash__bounties">
                    <div className="availablebounties__head">
                        Applied Bounties
                    </div>
                    {approvedBounties.map((bounty: any) => (
                        <div className="bountydash__devbounty">
                            <div className="devbountydash__leftmost">
                                <div className="devbountycont__left">
                                    <div className="devbountyleft__desc">
                                        {
                                            bounty.bounty.account
                                                .bountyDescription
                                        }
                                    </div>
                                    <div className="devbountyleft__names">
                                        <span className="devbountynames__project">
                                            {bounty.projectName}
                                        </span>
                                        |
                                        <span className="devbountynames__dao">
                                            {bounty.daoName}
                                        </span>
                                    </div>
                                </div>
                                <div className="devbountyleft__amount">
                                    {bounty.bounty.account.amount.toNumber() /
                                        USDC_DECIMALS}{" "}
                                    USDC
                                </div>
                            </div>
                            <div className="devbountyright__status">
                                {bounty.status.approved && (
                                    <div className="devapproved__cont">
                                        <span className="status__approved">
                                            Approved
                                        </span>
                                        <button
                                            className="devapproved__button"
                                            onClick={() => {
                                                handleSubmitBounty(bounty);
                                            }}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {submittedBounties.map((bounty: any) => (
                        <div className="bountydash__devbounty">
                            <div className="devbountydash__leftmost">
                                <div className="devbountycont__left">
                                    <div className="devbountyleft__desc">
                                        {
                                            bounty.bounty.account
                                                .bountyDescription
                                        }
                                    </div>
                                    <div className="devbountyleft__names">
                                        <span className="devbountynames__project">
                                            {bounty.projectName}
                                        </span>
                                        |
                                        <span className="devbountynames__dao">
                                            {bounty.daoName}
                                        </span>
                                    </div>
                                </div>
                                <div className="devbountyleft__amount">
                                    {bounty.bounty.account.amount.toNumber() /
                                        USDC_DECIMALS}{" "}
                                    USDC
                                </div>
                            </div>
                            <div className="devbountyright__status">
                                {bounty.status.submitted && (
                                    <span className="status__submitted">
                                        Submitted
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {appliedBounties.map((bounty: any) => (
                        <div className="bountydash__devbounty">
                            <div className="devbountydash__leftmost">
                                <div className="devbountycont__left">
                                    <div className="devbountyleft__desc">
                                        {
                                            bounty.bounty.account
                                                .bountyDescription
                                        }
                                    </div>
                                    <div className="devbountyleft__names">
                                        <span className="devbountynames__project">
                                            {bounty.projectName}
                                        </span>
                                        |
                                        <span className="devbountynames__dao">
                                            {bounty.daoName}
                                        </span>
                                    </div>
                                </div>
                                <div className="devbountyleft__amount">
                                    {bounty.bounty.account.amount.toNumber() /
                                        USDC_DECIMALS}{" "}
                                    USDC
                                </div>
                            </div>
                            <div className="devbountyright__status">
                                {bounty.status.noUpdate && (
                                    <span className="status__noupdate">
                                        Waiting
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {availableBounties.length !== 0 && (
                <div className="devbountydash__bounties">
                    <div className="availablebounties__head">
                        Available Bounties
                    </div>
                    {availableBounties.map((bounty: any) => (
                        <div className="bountydash__devbounty">
                            <div className="devbountydash__leftmost">
                                <div className="devbountycont__left">
                                    <div className="devbountyleft__desc">
                                        {
                                            bounty.bounty.account
                                                .bountyDescription
                                        }
                                    </div>
                                    <div className="devbountyleft__names">
                                        <span className="devbountynames__project">
                                            {bounty.projectName}
                                        </span>
                                        |
                                        <span className="devbountynames__dao">
                                            {bounty.daoName}
                                        </span>
                                    </div>
                                </div>
                                <div className="devbountyleft__amount">
                                    {bounty.bounty.account.amount.toNumber() /
                                        USDC_DECIMALS}{" "}
                                    USDC
                                </div>
                            </div>
                            <button
                                className="devbountyright__applybtn"
                                onClick={() => {
                                    handleApplyBounty(bounty);
                                }}
                            >
                                Apply
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {acceptedBounties.length !== 0 && (
                <div className="devbountydash__bounties">
                    <div className="availablebounties__head">
                        Accepted Bounties
                    </div>
                    {acceptedBounties.map((bounty: any) => (
                        <div className="bountydash__devbounty">
                            <div className="devbountydash__leftmost">
                                <div className="devbountycont__left">
                                    <div className="devbountyleft__desc">
                                        {
                                            bounty.bounty.account
                                                .bountyDescription
                                        }
                                    </div>
                                    <div className="devbountyleft__names">
                                        <span className="devbountynames__project">
                                            {bounty.projectName}
                                        </span>
                                        |
                                        <span className="devbountynames__dao">
                                            {bounty.daoName}
                                        </span>
                                    </div>
                                </div>
                                <div className="devbountyleft__amount">
                                    {bounty.bounty.account.amount.toNumber() /
                                        USDC_DECIMALS}{" "}
                                    USDC
                                </div>
                            </div>
                            <div className="devbountyright__status">
                                {bounty.status.accepted && (
                                    <span className="status__accepted">
                                        Accepted
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {appliedBounties.length +
                availableBounties.length +
                acceptedBounties.length ===
                0 && <div style={{ marginTop: "20px" }}>Nothing to Show</div>}
        </div>
    );
}

export default DevBountyDash;
