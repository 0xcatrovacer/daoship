use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Project {
    /// Name of the Project
    pub name: String,

    /// Display image link
    pub img_link: String,

    /// Authority of the Project
    pub authority: Pubkey,

    /// Vault Token Account of the Project
    pub project_vault: Pubkey,

    /// Mint of the vault token
    pub vault_mint: Pubkey,

    /// Reputation of the Project
    pub reputation: i64,

    /// Number of available jobs across the platform
    pub available_jobs: u64,

    /// Number of completed hirings
    pub completed_hirings: u64,

    /// Number of available bounties
    pub available_bounties: u64,

    /// Number of completed bounties
    pub completed_bounties: u64,
}

impl Project {
    pub const LEN: usize = DISCRIMINATOR_LENGTH  // 8-byte discriminator
        + NAME_LENGTH                            // Name of the Project
        + IMAGE_LINK_LENGTH                      // Link of the Image
        + PUBKEY_LENGTH                          // Project authority
        + PUBKEY_LENGTH                          // Project vault
        + PUBKEY_LENGTH                          // Vault mint
        + DATA_LENGTH                            // Reputation
        + DATA_LENGTH                            // Available jobs
        + DATA_LENGTH                            // Completed hirings
        + DATA_LENGTH                            // Available bounties
        + DATA_LENGTH; // Completed bounties
}
