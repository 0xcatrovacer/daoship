use anchor_lang::prelude::*;

use crate::{state::*, errors::ErrorCodes, constants::COMPLETE_BOUNTY_REP};

#[derive(Accounts)]
pub struct SubmitBountyForReview<'info> {
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

    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    #[account(
        mut,
        seeds=[b"user", authority.key().as_ref()],
        bump=user.bump,
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<SubmitBountyForReview>, submission_link: String) -> Result<()> {
    if *ctx.accounts.authority.key != ctx.accounts.user.key() {
        return Err(ErrorCodes::Unauthorized.into());
    }

    let bounty_application = &mut ctx.accounts.bounty_application;
    let user = &mut ctx.accounts.user;

    bounty_application.submission_link = submission_link;
    user.reputation += COMPLETE_BOUNTY_REP;

    Ok(())
}