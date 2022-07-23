use anchor_lang::prelude::*;
use std::str::FromStr;

use crate::constants::DAOSHIP_ADMIN_PUBKEY;
use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct WhitelistDao<'info> {
    #[account(
        mut,
        seeds = [b"dao", dao.authority.key().as_ref()],
        bump = dao.bump,
    )]
    pub dao: Account<'info, Dao>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<WhitelistDao>) -> Result<()> {
    if *ctx.accounts.authority.to_account_info().key
        != Pubkey::from_str(DAOSHIP_ADMIN_PUBKEY).unwrap()
    {
        return Err(ErrorCode::Unauthorized.into());
    }

    ctx.accounts.dao.is_whitelisted = true;

    Ok(())
}
