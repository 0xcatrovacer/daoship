use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct BountyApplication {
    /// Bounty being applied to
    pub bounty: Pubkey,

    /// Project this bounty belongs to
    pub project: Pubkey,

    /// User applying for this bounty
    pub user: Pubkey,

    /// User Token Account
    pub user_token_account: Pubkey,

    /// Timestamp of applying
    pub ts: i64,

    /// Application status
    pub application_status: BountyStatus,

    /// Bump
    pub bump: u8,
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone, Copy)]
pub enum BountyStatus {
    NoUpdate,
    Approved,
    Rejected,
    Accepted,
}

impl BountyApplication {
    pub const LEN: usize = DISCRIMINATOR_LENGTH // 8-byte discriminator
        + PUBKEY_LENGTH                         // Bounty
        + PUBKEY_LENGTH                         // Project
        + PUBKEY_LENGTH                         // User
        + PUBKEY_LENGTH                         // User Token Account
        + DATA_LENGTH                           // Timestamp
        + ENUM_LENGTH                           // Application Status
        + BOOL_LENGTH; // Bump
}
