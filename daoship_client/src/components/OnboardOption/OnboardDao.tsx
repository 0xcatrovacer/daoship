import React, { useState } from "react";
import {
    Address,
    AnchorProvider,
    Program,
    utils,
    web3,
} from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { USDC_MINT } from "../../constants";

type OnboardOptionProps = {
    setDisplayType: (displayType: string) => void;
    program: Program;
    provider: AnchorProvider;
};

function OnboardDao({ setDisplayType, program, provider }: OnboardOptionProps) {
    const [daoName, setDaoName] = useState("");

    const { publicKey } = useWallet();

    const handleOnboardDAO = async () => {
        try {
            const usdcMint = new PublicKey(USDC_MINT);

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

            const [daoPDA, _daoBump] = await web3.PublicKey.findProgramAddress(
                [
                    utils.bytes.utf8.encode("dao"),
                    publicKey?.toBuffer() as Buffer,
                ],
                program.programId
            );

            await program.methods
                .initDao(daoName, "")
                .accounts({
                    dao: daoPDA,
                    daoVaultMint: usdcMint,
                    daoVaultTokenAccount: userTokenAccount,
                    authority: publicKey as PublicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([])
                .rpc();

            const createdDAO = program.account.dao.fetch(daoPDA as Address);

            console.log(createdDAO);

            setDisplayType("is_dao");

            window.location.reload();
        } catch (e) {
            throw new Error(`Error creating DAO: ${e}`);
        }
    };

    return (
        <div className="obdao__container">
            <div className="obdao__head">Onboard As A DAO</div>
            <div className="obdao__subtext">
                Create your DAO Account, whitelist projects, and get access
                <br />
                to opportunities in web3 to your DAO members!
            </div>
            <div className="obdao__formcont">
                <div className="obdao__implabel">Name of your DAO?</div>
                <input
                    type="text"
                    className="obdao__nameinp"
                    value={daoName}
                    onChange={(e) => setDaoName(e.target.value)}
                    required
                />
                <button className="obdao__button" onClick={handleOnboardDAO}>
                    Onboard
                </button>
            </div>
        </div>
    );
}

export default OnboardDao;
