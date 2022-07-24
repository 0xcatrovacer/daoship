use anchor_lang::prelude::*;

use crate::constants::CLOSE_JOB_REP;
use crate::state::*;
use crate::errors::ErrorCodes;

#[derive(Accounts)]
pub struct CloseJobListing<'info> {
    #[account(
        mut,
        seeds=[
            b"job",
            dao.key().as_ref(), 
            project.key().as_ref(), 
            project.total_jobs.to_string().as_bytes(),
        ],
        bump=job.bump,
        close=authority
    )]
    pub job: Account<'info, Job>,

    #[account(mut)]
    pub dao: Account<'info, Dao>,

    #[account(mut, has_one=authority)]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<CloseJobListing>) -> Result<()> {
    if *ctx.accounts.authority.to_account_info().key != ctx.accounts.project.authority.key() {
        return Err(ErrorCodes::Unauthorized.into());
    }

    ctx.accounts.project.reputation += CLOSE_JOB_REP;

    Ok(())
}