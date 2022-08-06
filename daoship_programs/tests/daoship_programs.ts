import * as anchor from "@project-serum/anchor";
import { Address, Program } from "@project-serum/anchor";
import {createAccount, createMint} from '@solana/spl-token'
import {LAMPORTS_PER_SOL, PublicKey, Keypair} from '@solana/web3.js'
import { assert } from "chai";
import { DaoshipPrograms } from "../target/types/daoship_programs";

describe("daoship_programs", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.DaoshipPrograms as Program<DaoshipPrograms>;
  
  let usdcMint = null;
  let mintAuthority: Keypair = null;

  let dao: PublicKey = null;
  let daoAuthority: Keypair = null;
  let daoUsdcTokenAccount = null;

  it("Can initialize the state of the program", async () => {
    mintAuthority = anchor.web3.Keypair.generate();
    daoAuthority = anchor.web3.Keypair.generate();

    const fundMintAuthority = await program.provider.connection.requestAirdrop(
      mintAuthority.publicKey, 10 * LAMPORTS_PER_SOL
    );
    const fundDaoAuthority = await program.provider.connection.requestAirdrop(
      daoAuthority.publicKey, 5 * LAMPORTS_PER_SOL
    )

    await program.provider.connection.confirmTransaction(fundMintAuthority);
    await program.provider.connection.confirmTransaction(fundDaoAuthority);

    usdcMint = await createMint(
      provider.connection,
      mintAuthority,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      6
    )

    daoUsdcTokenAccount = await createAccount(
      provider.connection,
      daoAuthority,
      usdcMint,
      daoAuthority.publicKey,
    )

  });

  it("Can initialize DAO", async () => {
    const [_dao, _daoBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('dao'),
        daoAuthority.publicKey.toBuffer(),
      ],
      program.programId
    )

    dao = _dao;

    await program.methods
      .initDao('DaoshipDAO', 'https://assets.daoship.io')
      .accounts({
        dao: dao,
        daoVaultMint: usdcMint,
        daoVaultTokenAccount: daoUsdcTokenAccount,
        authority: daoAuthority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([daoAuthority])
      .rpc()

    const createdDao = await program.account.dao.fetch(dao);

    assert.strictEqual(createdDao.name, 'DaoshipDAO');
    assert.strictEqual(createdDao.imgLink, 'https://assets.daoship.io');
    assert.strictEqual(createdDao.authority.toBase58(), daoAuthority.publicKey.toBase58());
    assert.strictEqual(createdDao.daoVault.toBase58(), daoUsdcTokenAccount.toBase58());
    assert.strictEqual(createdDao.vaultMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(createdDao.isWhitelisted, false);
    assert.strictEqual(createdDao.bump, _daoBump);
  })

  it("Can whitelist a DAO", async () => {
    await program.methods.whitelistDao()
      .accounts({
        dao: dao,
        daoAuthority: daoAuthority.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const whitelistedDao = await program.account.dao.fetch(dao);

    assert.strictEqual(whitelistedDao.isWhitelisted, true);
  })
});
