use anchor_lang::prelude::*;

use crate::{state::*, errors::ErrorCodes};

#[derive(Accounts)]
pub struct InitWhitelistProject<'info> {
    #[account(
        init,
        seeds=[
            b"whitelist",
            dao.key().as_ref(), 
            project.key().as_ref()
        ],
        bump,
        payer=authority,
        space=ProjectWhitelist::LEN
    )]
    pub project_whitelist: Account<'info, ProjectWhitelist>,

    #[account(mut)]
    pub dao: Account<'info, Dao>,

    #[account(mut, has_one=authority)]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>
}

pub fn handler(ctx: Context<InitWhitelistProject>) -> Result<()> {
    if *ctx.accounts.authority.key != ctx.accounts.project.authority.key() {
        return Err(ErrorCodes::Unauthorized.into())
    }

    let whitelist = &mut ctx.accounts.project_whitelist;

    whitelist.dao = ctx.accounts.dao.key();
    whitelist.project = ctx.accounts.project.key();
    whitelist.is_whitelisted = false;
    whitelist.bump = *ctx.bumps.get("project_whitelist").unwrap();

    Ok(())
}
