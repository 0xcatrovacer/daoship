import { Address, BN, Program, utils, web3 } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { USDC_DECIMALS, USDC_MINT } from "../../constants";

import "./ProjectBounty.css";

type ProjectBountyProps = {
    projectPda: PublicKey;
    payload: Record<any, string>;
    program: Program;
    setDisplayType: (displayType: string) => void;
};

function ProjectBounty({
    projectPda,
    payload,
    program,
    setDisplayType,
}: ProjectBountyProps) {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [whitelist, setWhitelist] = useState<any>();
    const [daoPubkey, setDaoPubkey] = useState<string>();
    const [bountyDesc, setBountyDesc] = useState<string>();
    const [bountyAmount, setBountyAmount] = useState<any>();
    const [projectWhitelist, setProjectWhitelist] = useState<string>();
    const [bounties, setBounties] = useState<any>();
    const [bountyDisplayType, setBountyDisplayType] =
        useState<string>("all_bounties");
    const [managedBounty, setManagedBounty] = useState<any>();
    const [bountyApplications, setBountyApplications] = useState<any>([]);

    const { publicKey } = useWallet();

    const handleCreateBounty = async (daoPubkey: string) => {
        console.log("payload: ", payload);

        const dao = new PublicKey(daoPubkey);

        const [bounty, _bountyBump] = await web3.PublicKey.findProgramAddress(
            [
                utils.bytes.utf8.encode("bounty"),
                dao.toBuffer(),
                projectPda.toBuffer(),
                Buffer.from(payload.totalBounties.toString()),
            ],
            program.programId
        );

        const [bountyVault, _bountyVaultBump] =
            await web3.PublicKey.findProgramAddress(
                [
                    utils.bytes.utf8.encode("bounty-vault"),
                    dao.toBuffer(),
                    projectPda.toBuffer(),
                    Buffer.from(payload.totalBounties.toString()),
                ],
                program.programId
            );

        const [_bountyVaultAuthority, _vaultAuthorityBump] =
            await web3.PublicKey.findProgramAddress(
                [Buffer.from("bounty-escrow")],
                program.programId
            );

        const projectBountyTokenAccount = await getAssociatedTokenAddress(
            new PublicKey(USDC_MINT),
            publicKey as PublicKey
        );

        await program.methods
            .initBountyListing(
                new BN((bountyAmount as number) * USDC_DECIMALS),
                bountyDesc
            )
            .accounts({
                bounty: bounty,
                dao: dao,
                project: projectPda,
                bountyVaultTokenAccount: bountyVault,
                bountyVaultMint: new PublicKey(USDC_MINT),
                authorityTokenAccount: projectBountyTokenAccount,
                authority: publicKey as PublicKey,
                projectWhitelist: new PublicKey(projectWhitelist as string),
                systemProgram: web3.SystemProgram.programId,
                clock: web3.SYSVAR_CLOCK_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([])
            .rpc();

        const createdBounty = await program.account.bounty.fetch(bounty);
        console.log(createdBounty);
    };

    const handleApproveDev = async (application: any) => {
        await program.methods
            .approveUserForBounty()
            .accounts({
                bountyApplication: application.application.publicKey,
                bounty: application.application.account.bounty,
                project: projectPda,
                user: application.application.account.user,
                authority: publicKey as PublicKey,
            })
            .signers([])
            .rpc();

        const approvedApplication =
            await program.account.bountyApplication.fetch(
                application.application.publicKey
            );

        console.log(approvedApplication);
    };

    const callFn = async () => {
        const projectWhitelists = await program.account.projectWhitelist.all([
            {
                memcmp: {
                    offset: 8 + 32,
                    bytes: projectPda.toBase58(),
                },
            },
        ]);

        const whitelistsArray: any = [];

        projectWhitelists.map(async (wl) => {
            if (wl.account.isWhitelisted) {
                const dao = await program.account.dao.fetch(
                    wl.account.dao as PublicKey
                );

                whitelistsArray.push({
                    dao,
                    daoPubkey: wl.account.dao,
                    projectWhitelist: wl.publicKey,
                });

                setWhitelist(whitelistsArray);
            }
        });

        const createdBounties = await program.account.bounty.all([
            {
                memcmp: {
                    offset: 8,
                    bytes: projectPda.toBase58(),
                },
            },
        ]);

        console.log("createdBounties", createdBounties);

        const addBounties: any = [];

        createdBounties.map(async (bounty) => {
            const dao: any = await program.account.dao.fetch(
                bounty.account.dao as Address
            );

            addBounties.push({ bounty, daoName: dao.name });
        });

        setTimeout(() => {
            console.log("whitelistsArray", whitelistsArray);
            setDaoPubkey(whitelistsArray[0].daoPubkey.toBase58());
            setProjectWhitelist(whitelistsArray[0].projectWhitelist.toBase58());
            setBounties(addBounties);
        }, 200);
    };

    const manageBountyCallFn = async () => {
        const applications = await program.account.bountyApplication.all([
            {
                memcmp: {
                    offset: 8,
                    bytes: managedBounty.bounty.publicKey.toBase58(),
                },
            },
        ]);

        console.log("applications", applications);

        const managedApplications: Array<any> = [];

        applications.map(async (application: any) => {
            const dev: any = await program.account.user.fetch(
                application.account.user as PublicKey
            );

            managedApplications.push({
                application,
                devName: dev.displayName,
                devRep: dev.reputation.toNumber(),
            });
        });

        setTimeout(() => {
            console.log("bountyApplications", managedApplications);
            setBountyApplications(managedApplications);
        }, 400);
    };

    useEffect(() => {
        if (bountyDisplayType === "all_bounties") {
            callFn();
        } else if (bountyDisplayType === "manage_bounty") {
            manageBountyCallFn();
        }
    }, [bountyDisplayType]);

    return (
        <div className="projectbounty__cont">
            <div className="projectbounty__head">Bounty Dashboard</div>
            {bountyDisplayType === "all_bounties" && (
                <span>
                    <div className="projectbounty__create">
                        <div className="projectbounty__createhead">
                            List a New Bounty
                        </div>
                        <button
                            className="projectbounty__createbtn"
                            onClick={() => {
                                isFormVisible
                                    ? setIsFormVisible(false)
                                    : setIsFormVisible(true);
                            }}
                        >
                            Create a Bounty
                        </button>
                        {isFormVisible && (
                            <div className="projectbounty__createform">
                                <div className="pbform__desc">
                                    <div className="pbform__desclabel">
                                        Bounty description?
                                    </div>
                                    <input
                                        type="text"
                                        className="pbform__descinp"
                                        onChange={(e) => {
                                            setBountyDesc(e.target.value);
                                        }}
                                        required
                                    />
                                </div>
                                <div className="pbform__amount">
                                    <div className="pbform__amountlabel">
                                        Bounty reward amount ( USDC )?
                                    </div>
                                    <input
                                        type="number"
                                        className="pbform__amountinp"
                                        onChange={(e) => {
                                            setBountyAmount(e.target.value);
                                        }}
                                        required
                                    />
                                </div>
                                <div className="pbform__dao">
                                    <div className="pbform__daolabel">
                                        List at which DAO?
                                    </div>
                                    <select
                                        name="dao"
                                        className="pbform__daoinp"
                                        defaultValue={whitelist[0].daoPubkey.toBase58()}
                                        // onChange={(e) => {
                                        //     setDaoPubkey(e.target.value);
                                        // }}
                                        required
                                    >
                                        {whitelist &&
                                            whitelist.map((wl: any) => (
                                                <option
                                                    value={wl.daoPubkey.toBase58()}
                                                >
                                                    {wl.dao.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <button
                                    className="pbform__btn"
                                    onClick={() => {
                                        handleCreateBounty(daoPubkey as string);
                                    }}
                                >
                                    Create
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="projectbounty__createdbountiescont">
                        <div className="projbounty__cbhead">
                            Created Bounties
                        </div>
                        {bounties && (
                            <div className="bounties__cont">
                                {bounties.map((bounty: any) => (
                                    <div className="bounties__bounty">
                                        <div className="bounties__bountyleft">
                                            <div className="bounties__bountyhead">
                                                {
                                                    bounty.bounty.account
                                                        .bountyDescription
                                                }
                                            </div>
                                            <div className="bounties__bountydao">
                                                {bounty.daoName} |{" "}
                                                <span className="bounties__bountyamount">
                                                    {bounty.bounty.account.amount.toNumber() /
                                                        USDC_DECIMALS}{" "}
                                                    USDC
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className="bounties__managebtn"
                                            onClick={() => {
                                                setBountyDisplayType(
                                                    "manage_bounty"
                                                );
                                                setManagedBounty(bounty);
                                            }}
                                        >
                                            Manage
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </span>
            )}
            {bountyDisplayType === "manage_bounty" && (
                <div className="projectbounty__createdbountiescont">
                    <div className="arrowback">
                        <ArrowBackIcon
                            onClick={() => {
                                setBountyDisplayType("all_bounties");
                            }}
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                    {managedBounty && (
                        <div className="managedbounty__cont">
                            <div className="managedbounty__deets">
                                <span className="managebounty__desc">
                                    {
                                        managedBounty.bounty.account
                                            .bountyDescription
                                    }
                                </span>
                                |
                                <span className="managedbounty__amount">
                                    {managedBounty.bounty.account.amount.toNumber() /
                                        USDC_DECIMALS}{" "}
                                    USDC
                                </span>
                            </div>
                            <div className="managedbounty__daoname">
                                {managedBounty.daoName}
                            </div>
                            <div className="bountyapplicationsx">
                                {bountyApplications.length !== 0 && (
                                    <div className="bountyapplications__cont">
                                        <div className="applicationsx__head">
                                            Approve Requests
                                        </div>
                                        <div className="bountyapplications__head">
                                            {bountyApplications.map(
                                                (application: any) => (
                                                    <div className="managedapplication__cont">
                                                        <div className="managedapplication__left">
                                                            <div className="managedapplication__devname">
                                                                {
                                                                    application.devName
                                                                }
                                                            </div>
                                                            <div className="managedapplication__devrep">
                                                                Reputation:{" "}
                                                                {
                                                                    application.devRep
                                                                }
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="managedapplication__approve"
                                                            onClick={() => {
                                                                handleApproveDev(
                                                                    application
                                                                );
                                                            }}
                                                        >
                                                            Approve
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProjectBounty;
