use anchor_lang::prelude::*;

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
