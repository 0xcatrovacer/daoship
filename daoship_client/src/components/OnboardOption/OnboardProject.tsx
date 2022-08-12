import React, { useState } from "react";
import { AnchorProvider, Program, utils, web3 } from "@project-serum/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

type OnboardOptionProps = {
    setDisplayType: (displayType: string) => void;
    program: Program;
    provider: AnchorProvider;
};

function OnboardProject({
    setDisplayType,
    program,
    provider,
}: OnboardOptionProps) {
    const [projectName, setProjectName] = useState("");

    const { publicKey } = useWallet();

    const handleOnboardProject = async () => {
        try {
            const usdcMint = new PublicKey(
                "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
            );

            const transaction = new Transaction();

            const userTokenAccount = await getAssociatedTokenAddress(
                usdcMint,
                publicKey as PublicKey
            );

            try {
                await getAccount(provider.connection, userTokenAccount);
            } catch (e) {
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey as PublicKey,
                        userTokenAccount,
                        publicKey as PublicKey,
                        usdcMint
                    )
                );
            }

            await provider.sendAndConfirm(transaction);

            const [projectPDA, _projectBump] =
                await web3.PublicKey.findProgramAddress(
                    [
                        utils.bytes.utf8.encode("project"),
                        publicKey?.toBuffer() as Buffer,
                    ],
                    program.programId
                );

            await program.methods
                .initProject(projectName, "")
                .accounts({
                    project: projectPDA,
                    authority: publicKey as PublicKey,
                    projectVaultMint: usdcMint,
                    projectVaultTokenAccount: userTokenAccount,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([])
                .rpc();

            const createdProject = await program.account.project.fetch(
                projectPDA
            );

            console.log(createdProject);
            setDisplayType("is_project");
        } catch (e) {
            throw new Error(`Error creating project: ${e}`);
        }
    };

    return (
        <div className="obproject__container">
            <div className="obproject__head">Onboard as Project</div>
            <div className="obproject__subtext">
                Create your Project Account,
                <br />
                list Bounties & Jobs on DAO Pages!
            </div>
            <div className="obproject__formcont">
                <div className="obproject__implabel">Name of your Project?</div>
                <input
                    type="text"
                    className="obproject__nameinp"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                />
                <button
                    className="obproject__button"
                    onClick={handleOnboardProject}
                >
                    Onboard
                </button>
            </div>
        </div>
    );
}

export default OnboardProject;
