use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Dao {
    /// Name of the DAO
    pub name: String,

    /// Display image link
    pub img_link: String,

    /// Authority of the DAO (will change to a multisig later)
    pub authority: Pubkey,

    /// Vault Token Account of the DAO
    pub dao_vault: Pubkey,

    /// Mint of the Vault Token
    pub vault_mint: Pubkey,

    /// Number of projects whitelisted by the DAO
    pub whitelisted_projects: u64,

    /// Number of jobs available on the DAO's platform
    pub available_jobs: u64,

    /// Number of completed hirings through the DAO
    pub completed_hirings: u64,

    /// Number of bounties available on the DAO's platform
    pub available_bounites: u64,

    /// Number of completed bounties
    pub completed_bounties: u64,
}

impl Dao {
    pub const LEN: usize = DISCRIMINATOR_LENGTH      // 8-byte discriminator
        + NAME_LENGTH                                // name
        + IMAGE_LINK_LENGTH                          // Link of DAO's image
        + PUBKEY_LENGTH                              // Authority of DAO
        + PUBKEY_LENGTH                              // DAO Vault Token Account
        + PUBKEY_LENGTH                              // Mint of DAO Token
        + DATA_LENGTH                                // Whitelisted Projects
        + DATA_LENGTH                                // Available Jobs
        + DATA_LENGTH                                // Completed Hirings
        + DATA_LENGTH                                // Available Bounties
        + DATA_LENGTH; // Completed Bounties
}
