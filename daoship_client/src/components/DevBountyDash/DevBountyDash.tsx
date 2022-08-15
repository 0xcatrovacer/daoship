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

    const { publicKey } = useWallet();

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
            } else if (flag == "applied") {
                applied.push({
                    bounty,
                    daoName: dao.name,
                    projectName: project.name,
                    status: application[0].account.applicationStatus,
                });
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
            setAvailableBounties(addBounties);
            setAppliedBounties(applied);
        }, 600);
    };

    useEffect(() => {
        callFn();
    }, []);

    return (
        <div className="devbountydash__cont">
            <div className="devbountydash__head">Bounty Dashboard</div>

            {appliedBounties && (
                <div className="devbountydash__bounties">
                    <div className="availablebounties__head">
                        Applied Bounties
                    </div>
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
                                {bounty.status.approved && (
                                    <div className="devapproved__cont">
                                        <span className="status__approved">
                                            Approved
                                        </span>
                                        <button className="devapproved__button">
                                            Submit
                                        </button>
                                    </div>
                                )}
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

            {availableBounties && (
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
        </div>
    );
}

export default DevBountyDash;
