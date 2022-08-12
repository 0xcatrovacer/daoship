import React, { useState } from "react";
import { AnchorProvider, Program, utils, web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

type OnboardOptionProps = {
    setDisplayType: (displayType: string) => void;
    program: Program;
    provider: AnchorProvider;
};

function OnboardDev({ setDisplayType, program, provider }: OnboardOptionProps) {
    const [userName, setUserName] = useState("");
    const [bio, setBio] = useState("");

    const { publicKey } = useWallet();

    const handleOnboardDev = async () => {
        try {
            const [devPDA, _devBump] = await web3.PublicKey.findProgramAddress(
                [
                    utils.bytes.utf8.encode("user"),
                    publicKey?.toBuffer() as Buffer,
                ],
                program.programId
            );

            await program.methods
                .initUser(userName, bio)
                .accounts({
                    user: devPDA,
                    authority: publicKey as PublicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([])
                .rpc();

            const createdUser = await program.account.user.fetch(devPDA);

            console.log(createdUser);
            setDisplayType("is_user");
        } catch (e) {
            throw new Error(`Error creating user: ${e}`);
        }
    };

    return (
        <div className="obdev__container">
            <div className="obdev__head">Onboard as Developer</div>
            <div className="obdev__subtext">
                Create your User Account,
                <br />
                Get Access to Jobs & Bounties on Solana
            </div>
            <div className="obdev__formcont">
                <div className="obdev__namelabel">Username?</div>
                <input
                    type="text"
                    className="obdev__nameinp"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />
                <div className="obdev__biolabel">Bio?</div>
                <input
                    type="text"
                    className="obdev__bioinp"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                />
                <button className="obdev__button" onClick={handleOnboardDev}>
                    Onboard
                </button>
            </div>
        </div>
    );
}

export default OnboardDev;
