import * as anchor from "@project-serum/anchor";
import { Address, Program } from "@project-serum/anchor";
import {createAccount, createMint, getAccount, mintTo, TOKEN_PROGRAM_ID} from '@solana/spl-token'
import {LAMPORTS_PER_SOL, PublicKey, Keypair} from '@solana/web3.js'
import { assert } from "chai";
import { DaoshipPrograms } from "../target/types/daoship_programs";

describe("daoship_programs", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.DaoshipPrograms as Program<DaoshipPrograms>;
  
  let usdcMint: PublicKey = null;
  let mintAuthority: Keypair = null;

  let dao: PublicKey = null;
  let daoAuthority: Keypair = null;
  let daoUsdcTokenAccount = null;

  let project: PublicKey = null;
  let projectAuthority: Keypair = null;
  let projectUsdcTokenAccount: PublicKey = null;
  let projectJobCount: number = null;
  let projectBountyCount: number = null;
  let projectRepCount: number = null;
  let projectBountyTokenAccount: PublicKey = null;

  let projectWhitelist: PublicKey = null;

  let job: PublicKey = null;

  let bounty: PublicKey = null;
  let bountyVault: PublicKey = null;
  let bountyVaultAuthority: PublicKey = null;
  let bountyTokenMint: PublicKey = null;
  let bountyAmount = new anchor.BN(5000);

  let user: PublicKey = null;
  let userAuthority: Keypair = null;

  it("Can initialize the state of the program", async () => {
    mintAuthority = anchor.web3.Keypair.generate();
    daoAuthority = anchor.web3.Keypair.generate();
    projectAuthority = anchor.web3.Keypair.generate();
    userAuthority = anchor.web3.Keypair.generate();

    const fundMintAuthority = await program.provider.connection.requestAirdrop(
      mintAuthority.publicKey, 10 * LAMPORTS_PER_SOL
    );
    const fundDaoAuthority = await program.provider.connection.requestAirdrop(
      daoAuthority.publicKey, 5 * LAMPORTS_PER_SOL
    );
    const fundProjectAuthority = await program.provider.connection.requestAirdrop(
      projectAuthority.publicKey, 5 * LAMPORTS_PER_SOL
    );
    const fundUserAuthority = await program.provider.connection.requestAirdrop(
      userAuthority.publicKey, 5 * LAMPORTS_PER_SOL
    );

    await program.provider.connection.confirmTransaction(fundMintAuthority);
    await program.provider.connection.confirmTransaction(fundDaoAuthority);
    await program.provider.connection.confirmTransaction(fundProjectAuthority);
    await program.provider.connection.confirmTransaction(fundUserAuthority);

    usdcMint = await createMint(
      provider.connection,
      mintAuthority,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      6
    );

    bountyTokenMint = await createMint(
      provider.connection,
      projectAuthority,
      projectAuthority.publicKey,
      projectAuthority.publicKey,
      0
    );

    daoUsdcTokenAccount = await createAccount(
      provider.connection,
      daoAuthority,
      usdcMint,
      daoAuthority.publicKey,
    );

    projectUsdcTokenAccount = await createAccount(
      provider.connection,
      projectAuthority,
      usdcMint,
      projectAuthority.publicKey,
    );

    projectBountyTokenAccount = await createAccount(
      provider.connection,
      projectAuthority,
      bountyTokenMint,
      projectAuthority.publicKey
    );

    await mintTo(
      provider.connection,
      projectAuthority,
      bountyTokenMint,
      projectBountyTokenAccount,
      projectAuthority,
      50000
    );
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

  it("Can initialize a Project", async () => {
    const [_project, _projectBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('project'),
        projectAuthority.publicKey.toBuffer(),
      ],
      program.programId,
    );

    project = _project;

    await program.methods.initProject('LendProtocol', 'https://assets.ledprotocol.io')
      .accounts({
        project: project,
        authority: projectAuthority.publicKey,
        projectVaultMint: usdcMint,
        projectVaultTokenAccount: projectUsdcTokenAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([projectAuthority])
      .rpc();

    const createdProject = await program.account.project.fetch(project);

    assert.strictEqual(createdProject.name, 'LendProtocol');
    assert.strictEqual(createdProject.imgLink, 'https://assets.ledprotocol.io');
    assert.strictEqual(createdProject.authority.toBase58(), projectAuthority.publicKey.toBase58());
    assert.strictEqual(createdProject.projectVault.toBase58(), projectUsdcTokenAccount.toBase58());
    assert.strictEqual(createdProject.vaultMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(createdProject.bump, _projectBump);
  })

  it("Can apply for project whitelist", async () => {
    const [_projectWhitelist, _projectWhitelistBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('whitelist'),
        dao.toBuffer(),
        project.toBuffer(),
      ],
      program.programId
    )

    projectWhitelist = _projectWhitelist;

    await program.methods.initWhitelistProject()
      .accounts({
        projectWhitelist: projectWhitelist,
        dao: dao,
        project: project,
        authority: projectAuthority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([projectAuthority])
      .rpc();

    const initializedWhitelist = await program.account.projectWhitelist.fetch(projectWhitelist);

    assert.strictEqual(initializedWhitelist.dao.toBase58(), dao.toBase58());
    assert.strictEqual(initializedWhitelist.project.toBase58(), project.toBase58());
    assert.strictEqual(initializedWhitelist.isWhitelisted, false);
    assert.strictEqual(initializedWhitelist.bump, _projectWhitelistBump);
  })

  it("Can whitelist project", async () => {
    await program.methods.whitelistProject()
      .accounts({
        projectWhitelist: projectWhitelist,
        dao: dao,
        project: project,
        authority: daoAuthority.publicKey,
      })
      .signers([daoAuthority])
      .rpc();

    const whitelisted = await program.account.projectWhitelist.fetch(projectWhitelist);

    assert.strictEqual(whitelisted.isWhitelisted, true);
  })

  it("Can initialize job listing", async () => {
    const jobLister = await program.account.project.fetch(project);
    projectJobCount = jobLister.totalJobs.toNumber();

    const [_job, _jobBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('job'),
        dao.toBuffer(),
        project.toBuffer(),
        Buffer.from(projectJobCount.toString()),
      ],
      program.programId
    );
    
    job = _job;

    await program.methods.initJobListing('https://joblisting.project.com')
      .accounts({
        job: job,
        dao: dao,
        project: project,
        authority: projectAuthority.publicKey,
        projectWhitelist: projectWhitelist,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      })
      .signers([projectAuthority])
      .rpc();

    const createdJobListing = await program.account.job.fetch(job);
    const jobListProject = await program.account.project.fetch(project);
    const asstDao = await program.account.dao.fetch(dao);

    assert.strictEqual(createdJobListing.project.toBase58(), project.toBase58());
    assert.strictEqual(createdJobListing.dao.toBase58(), dao.toBase58());
    assert.strictEqual(createdJobListing.jobDescription, 'https://joblisting.project.com');
    assert.strictEqual(createdJobListing.hiredStatus, false);
    assert.strictEqual(createdJobListing.bump, _jobBump);

    assert.strictEqual(jobListProject.totalJobs.toNumber(), projectJobCount + 1);
    projectJobCount += 1;
    assert.strictEqual(jobListProject.availableJobs.toNumber(), 1);
    assert.strictEqual(jobListProject.reputation.toNumber(), projectRepCount + 3);
    projectRepCount += 3;

    assert.strictEqual(asstDao.availableJobs.toNumber(), 1);
  });

  it("Can initialize bounty listing", async () => {
    const bountyLister = await program.account.project.fetch(project);
    projectBountyCount = bountyLister.totalBounties.toNumber();

    const [_bounty, _bountyBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('bounty'),
        dao.toBuffer(),
        project.toBuffer(),
        Buffer.from(projectBountyCount.toString()),
      ],
      program.programId,
    )

    bounty = _bounty

    const [_bountyVault, _bountyVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('bounty-vault'),
        dao.toBuffer(),
        project.toBuffer(),
        Buffer.from(projectBountyCount.toString())
      ],
      program.programId,
    )

    bountyVault = _bountyVault

    const [_bountyVaultAuthority, _vaultAuthorityBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('bounty-escrow')
      ],
      program.programId,
    )

    bountyVaultAuthority = _bountyVaultAuthority;

    await program.methods.initBountyListing(bountyAmount, 'https://bounty.project.io')
      .accounts({
        bounty: bounty,
        dao: dao,
        project: project,
        bountyVaultTokenAccount: bountyVault,
        bountyVaultMint: bountyTokenMint,
        authorityTokenAccount: projectBountyTokenAccount,
        authority: projectAuthority.publicKey,
        projectWhitelist: projectWhitelist,
        systemProgram: anchor.web3.SystemProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([projectAuthority])
      .rpc();

    const createdBounty = await program.account.bounty.fetch(bounty);
    const bountyVaultTokenAccount = await getAccount(provider.connection, bountyVault);
    const bountyListerProject = await program.account.project.fetch(project);
    const asstDao = await program.account.dao.fetch(dao);
    
    assert.strictEqual(createdBounty.project.toBase58(), project.toBase58());
    assert.strictEqual(createdBounty.dao.toBase58(), dao.toBase58());
    assert.strictEqual(createdBounty.bountyVaultMint.toBase58(), bountyTokenMint.toBase58());
    assert.strictEqual(createdBounty.bountyVaultAccount.toBase58(), bountyVault.toBase58());
    assert.strictEqual(createdBounty.amount.toNumber(), bountyAmount.toNumber());
    assert.strictEqual(createdBounty.bountyDescription, 'https://bounty.project.io');
    assert.strictEqual(createdBounty.isCompleted, false);
    assert.strictEqual(createdBounty.bump, _bountyBump);

    assert.strictEqual(bountyVaultTokenAccount.mint.toBase58(), bountyTokenMint.toBase58());
    assert.strictEqual(bountyVaultTokenAccount.owner.toBase58(), bountyVaultAuthority.toBase58());
    assert.strictEqual(bountyVaultTokenAccount.amount.toString(), bountyAmount.toNumber().toString());

    assert.strictEqual(bountyListerProject.totalBounties.toNumber(), projectBountyCount + 1);
    projectBountyCount += 1;
    assert.strictEqual(bountyListerProject.availableBounties.toNumber(), 1);
    assert.strictEqual(bountyListerProject.reputation.toNumber(), projectRepCount + 1);
    projectRepCount += 1;

    assert.strictEqual(asstDao.availableBounties.toNumber(), 1);
  });

  it("Can initialize user", async () => {
    const [_user, _userBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user'),
        userAuthority.publicKey.toBuffer()
      ],
      program.programId,
    );

    user = _user;

    await program.methods.initUser('catrovacer.sol', 'Seek and you shall find')
      .accounts({
        user: user,
        authority: userAuthority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([userAuthority])
      .rpc();

    const createdUser = await program.account.user.fetch(user);

    assert.strictEqual(createdUser.displayName, 'catrovacer.sol');
    assert.strictEqual(createdUser.authority.toBase58(), userAuthority.publicKey.toBase58());
    assert.strictEqual(createdUser.bio, 'Seek and you shall find');
    assert.strictEqual(createdUser.bump, _userBump);
  })
});
