use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct User {
    /// Name of user
    pub display_name: String,

    /// Authority of user
    pub authority: Pubkey,

    /// Bio of user
    pub bio: String,

    /// Reputation of user
    pub reputation: i64,

    /// Number of completed bounties
    pub completed_bounties: u64,

    /// Bump
    pub bump: u8,
}

impl User {
    pub const LEN: usize = DISCRIMINATOR_LENGTH  // 8-byte discriminator
        + NAME_LENGTH                            // Name
        + PUBKEY_LENGTH                          // Auhtority
        + BIO_LENGTH                             // Bio of user
        + DATA_LENGTH                            // Reputation
        + DATA_LENGTH                            // Number of completed bounties
        + BOOL_LENGTH; // PDA Bump
}
