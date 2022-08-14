use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Bounty {
    /// The project initializing the Job
    pub project: Pubkey,

    /// The dao where project is shown
    pub dao: Pubkey,

    /// Id of bounty
    pub id: u64,

    /// Bounty Vault Mint
    pub bounty_vault_mint: Pubkey,

    /// Bounty Token Account
    pub bounty_vault_account: Pubkey,

    /// Bounty Amount
    pub amount: u64,

    /// Timestamp when Job was posted
    pub post_ts: i64,

    /// Number of active applications
    pub applications: u64,

    /// Number of approved applicants
    pub approved: u64,

    /// Description of the job
    pub bounty_description: String,

    /// Bounty Completed
    pub is_completed: bool,

    /// Bounty Winner
    pub bounty_winner: Pubkey,

    /// Bump
    pub bump: u8,
}

impl Bounty {
    pub const LEN: usize = DISCRIMINATOR_LENGTH // 8-byte discriminator
        + PUBKEY_LENGTH                         // Project Pubkey
        + PUBKEY_LENGTH                         // DAO Pubkey
        + DATA_LENGTH                           // Bounty Id
        + PUBKEY_LENGTH                         // Mint of Bounty Vault Token
        + PUBKEY_LENGTH                         // Vault Account for Bounty
        + DATA_LENGTH                           // Amount For Bounty
        + DATA_LENGTH                           // Timestamp for Bounty post
        + DATA_LENGTH                           // Number of applicants
        + DATA_LENGTH                           // Number of approved users
        + LINK_LENGTH                           // Description of Bounty
        + BOOL_LENGTH                           // Bounty Completion Status
        + PUBKEY_LENGTH                         // Bounty Winner
        + BOOL_LENGTH; // Bump
}
