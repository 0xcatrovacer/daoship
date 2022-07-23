import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { DaoshipPrograms } from "../target/types/daoship_programs";

describe("daoship_programs", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DaoshipPrograms as Program<DaoshipPrograms>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
