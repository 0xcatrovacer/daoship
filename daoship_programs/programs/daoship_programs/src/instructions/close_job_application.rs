use anchor_lang::prelude::*;

use crate::{state::*, errors::ErrorCodes};

#[derive(Accounts)]
pub struct CloseJobApplication<'info> {
    #[account(
        mut,
        seeds=[
            b"job-application",
            job.key().as_ref(),
            user.key().as_ref(),
        ],
        bump=job_application.bump,
        has_one=job,
        has_one=user,
        close=authority,
    )]
    pub job_application: Box<Account<'info, JobApplication>>,

    #[account(mut, has_one=project)]
    pub job: Box<Account<'info, Job>>,

    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    #[account(
        mut,
        seeds=[b"user", authority.key().as_ref()],
        bump=user.bump
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<CloseJobApplication>) -> Result<()> {
    if *ctx.accounts.authority.key != ctx.accounts.user.authority {
        return Err(ErrorCodes::Unauthorized.into());
    }

    let job = &mut ctx.accounts.job;

    job.applications -= 1;

    Ok(())
}