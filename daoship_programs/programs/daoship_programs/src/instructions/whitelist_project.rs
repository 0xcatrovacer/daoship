use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCodes;

#[derive(Accounts)]
pub struct WhitelistProject<'info> {
    #[account(
        mut,
        seeds=[
            b"whitelist",
            dao.key().as_ref(), 
            project.key().as_ref()
        ],
        bump=project_whitelist.bump,
    )]
    pub project_whitelist: Box<Account<'info, ProjectWhitelist>>,

    #[account(mut, has_one=authority)]
    pub dao: Box<Account<'info, Dao>>,

    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<WhitelistProject>) -> Result<()> {
    if *ctx.accounts.authority.key != ctx.accounts.dao.authority.key() {
        return Err(ErrorCodes::Unauthorized.into())
    }

    if ctx.accounts.dao.is_whitelisted == false {
        return Err(ErrorCodes::Unauthorized.into())
    }

    let whitelist = &mut ctx.accounts.project_whitelist;

    whitelist.is_whitelisted = true;
    ctx.accounts.dao.whitelisted_projects += 1;

    Ok(())
}
