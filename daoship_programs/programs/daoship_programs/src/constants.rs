pub const DISCRIMINATOR_LENGTH: usize = 8;
pub const NAME_LENGTH: usize = 30 * 4;
pub const PUBKEY_LENGTH: usize = 32;
pub const LINK_LENGTH: usize = 50 * 4;
pub const DATA_LENGTH: usize = 8;
pub const BOOL_LENGTH: usize = 1;
pub const DAOSHIP_ADMIN_PUBKEY: &str = "FdkvKDmH8ikxmFcq9sZdnQYy1YZ7A5DJLQTmTGFmbAVq";
pub const BOUNTY_ESCROW_PDA_SEEDS: &[u8] = b"bounty-escrow";

pub const CREATE_JOB_REP: i64 = 3;
pub const HIRE_APPLICANT_REP: i64 = 20;
pub const CLOSE_JOB_REP: i64 = -5;
pub const CREATE_BOUNTY_REP: i64 = 1;
pub const ACCEPT_BOUNTY_REP: i64 = 15;
pub const CLOSE_BOUNTY_REP: i64 = -2;
pub const COMPLETE_BOUNTY_REP: i64 = 20;
pub const GET_HIRED_REP: i64 = 30;
