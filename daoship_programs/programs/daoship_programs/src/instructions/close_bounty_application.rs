use anchor_lang::prelude::*;

use crate::state::*;
use crate::errors::ErrorCodes;

#[derive(Accounts)]
pub struct CloseBountyApplication<'info> {
    #[account(
        mut,
        seeds=[
            b"bounty-application",
            bounty.key().as_ref(),
            user.key().as_ref(),
        ],
        bump=bounty_application.bump,
        close=authority
    )]
    pub bounty_application: Box<Account<'info, BountyApplication>>,

    #[account(mut, has_one=project)]
    pub bounty: Box<Account<'info, Bounty>>,

    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    #[account(
        mut,
        constraint = user.key() == *authority.key
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub authority: Signer<'info>
}

pub fn handler(ctx: Context<CloseBountyApplication>) -> Result<()> {
    if *ctx.accounts.authority.key != ctx.accounts.user.authority {
        return Err(ErrorCodes::Unauthorized.into());
    }

    ctx.accounts.bounty.applications -= 1;

    Ok(())
}