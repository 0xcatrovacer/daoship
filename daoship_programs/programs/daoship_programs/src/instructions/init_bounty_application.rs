use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

use crate::state::*;

#[derive(Accounts)]
pub struct InitBountyApplication<'info> {
    #[account(
        init,
        seeds=[
            b"bounty-application",
            bounty.key().as_ref(),
            user.key().as_ref(),
        ],
        bump,
        payer=authority,
        space=BountyApplication::LEN
    )]
    pub bounty_application: Box<Account<'info, BountyApplication>>,

    #[account(mut, has_one=project)]
    pub bounty: Box<Account<'info, Bounty>>,

    #[account(
        mut,
        seeds=[b"user", authority.key().as_ref()],
        bump=user.bump
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    #[account(
        mut,
        constraint = user_token_account.owner == *authority.to_account_info().key
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitBountyApplication>) -> Result<()> {
    let bounty_application = &mut ctx.accounts.bounty_application;
    let bounty = &mut ctx.accounts.bounty;

    bounty_application.bounty = bounty.key();
    bounty_application.project = ctx.accounts.project.key();
    bounty_application.user = ctx.accounts.user.key();
    bounty_application.user_token_account = ctx.accounts.user_token_account.key();
    bounty_application.ts = ctx.accounts.clock.unix_timestamp;
    bounty_application.application_status = BountyStatus::NoUpdate;
    bounty_application.bump = *ctx.bumps.get("bounty_application").unwrap();

    bounty.applications += 1;

    Ok(())
}