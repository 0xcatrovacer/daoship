use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct JobApplication {
    /// Job being applied to
    pub job: Pubkey,

    /// Project this job belongs to
    pub project: Pubkey,

    /// User applying for this job
    pub user: Pubkey,

    /// Timestamp of applying
    pub ts: i64,

    /// Resume link
    pub resume: String,

    /// Application status
    pub application_status: JobStatus,

    /// Bump
    pub bump: u8,
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum JobStatus {
    NoUpdate,
    Interviewing,
    Rejected,
    Hired,
}

impl JobApplication {
    pub const LEN: usize = DISCRIMINATOR_LENGTH  // 8 byte discriminator
        + PUBKEY_LENGTH                          // Job
        + PUBKEY_LENGTH                          // Project
        + PUBKEY_LENGTH                          // User
        + DATA_LENGTH                            // Timestamp
        + LINK_LENGTH                            // Resume Link
        + ENUM_LENGTH                            // Application status
        + BOOL_LENGTH; // Bump
}