use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct Job {
    /// The project initializing the Job
    pub project: Pubkey,

    /// The dao where project is shown
    pub dao: Pubkey,

    /// Timestamp when Job was posted
    pub post_ts: i64,

    /// Number of active applications
    pub applications: u64,

    /// Description of the job
    pub job_description: String,

    /// Hired status of job
    pub hired_status: bool,

    /// Hired applicant
    pub hired: Pubkey,

    /// Bump
    pub bump: u8,
}

impl Job {
    pub const LEN: usize = DISCRIMINATOR_LENGTH // 8-byte discriminator
        + PUBKEY_LENGTH                         // Project Pubkey
        + PUBKEY_LENGTH                         // DAO Pubkey
        + DATA_LENGTH                           // Job post timestamp
        + DATA_LENGTH                           // Number of applicants
        + LINK_LENGTH                           // Job Description Link
        + BOOL_LENGTH                           // Hired Status
        + PUBKEY_LENGTH                         // Hired User
        + BOOL_LENGTH; // Bump
}
