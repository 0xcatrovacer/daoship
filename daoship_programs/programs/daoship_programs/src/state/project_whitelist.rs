use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct ProjectWhitelist {
    /// DAO whitelisting the project
    pub dao: Pubkey,

    /// Project being whitelisted
    pub project: Pubkey,

    /// Whitelist status
    pub is_whitelisted: bool,

    /// Bump
    pub bump: u8,
}

impl ProjectWhitelist {
    pub const LEN: usize = DISCRIMINATOR_LENGTH  // 8-byte discriminator
     + PUBKEY_LENGTH                                // DAO whitelisting the company
     + PUBKEY_LENGTH                                // Project being whitelisted
     + BOOL_LENGTH                                  // Whitelist status
     + BOOL_LENGTH; // Bump
}
