use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCodes {
    #[msg("Name Too Long")]
    NameTooLong,
    #[msg("Link Too Long")]
    LinkTooLong,
    #[msg("Bio Too Long")]
    BioTooLong,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Not approved by project")]
    NotApproved,
}
