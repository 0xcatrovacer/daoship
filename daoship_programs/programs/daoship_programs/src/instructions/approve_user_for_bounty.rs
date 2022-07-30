use anchor_lang::prelude::*;

use crate::{state::*, errors::ErrorCodes};

#[derive(Accounts)]
pub struct ApproveUserForBounty<'info> {
    #[account(
        mut,
        seeds=[
            b"bounty-application",
            bounty.key().as_ref(),
            user.key().as_ref(),
        ],
        bump=bounty_application.bump,
    )]
    pub bounty_application: Box<Account<'info, BountyApplication>>,

    #[account(mut, has_one=project)]
    pub bounty: Box<Account<'info, Bounty>>,

    #[account(
        mut,
        seeds=[b"project", authority.key().as_ref()],
        bump=project.bump
    )]
    pub project: Box<Account<'info, Project>>,

    #[account(
        mut,
        constraint = user.key() == bounty_application.user
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub authority: Signer<'info>
}

pub fn handler(ctx: Context<ApproveUserForBounty>) -> Result<()> {
    if *ctx.accounts.authority.key != ctx.accounts.project.authority {
        return Err(ErrorCodes::Unauthorized.into());
    }

    ctx.accounts.bounty.approved += 1;

    ctx.accounts.bounty_application.application_status = BountyStatus::Approved;

    Ok(())
}