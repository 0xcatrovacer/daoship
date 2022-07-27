use anchor_lang::prelude::*;

use crate::constants::CREATE_JOB_REP;
use crate::state::*;
use crate::errors::ErrorCodes;

#[derive(Accounts)]
pub struct InitJobListing<'info> {
    #[account(
        init,
        seeds=[
            b"job",
            dao.key().as_ref(), 
            project.key().as_ref(), 
            project.total_jobs.to_string().as_bytes(),
        ],
        bump,
        payer = authority,
        space = Job::LEN
    )]
    pub job: Box<Account<'info, Job>>,

    #[account(mut)]
    pub dao: Box<Account<'info, Dao>>,

    #[account(mut, has_one=authority)]
    pub project: Box<Account<'info, Project>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, has_one=project, has_one=dao)]
    pub project_whitelist: Box<Account<'info, ProjectWhitelist>>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info, Clock>
}

pub fn handler(ctx: Context<InitJobListing>, description: String) -> Result<()> {
    if *ctx.accounts.authority.to_account_info().key != ctx.accounts.project.authority.key() {
        return Err(ErrorCodes::Unauthorized.into());
    }

    if ctx.accounts.project_whitelist.is_whitelisted == false {
        return Err(ErrorCodes::Unauthorized.into());
    }

    let job = &mut ctx.accounts.job;
    let dao = &mut ctx.accounts.dao;
    let project = &mut ctx.accounts.project;

    job.project = project.key();
    job.dao = dao.key();
    job.post_ts = ctx.accounts.clock.unix_timestamp;
    job.applications = 0;
    job.job_description = description;
    job.hired_status = false;
    job.bump = *ctx.bumps.get("job").unwrap();

    dao.available_jobs += 1;
    
    project.total_jobs += 1;
    project.available_jobs += 1;
    project.reputation += CREATE_JOB_REP;

    Ok(())
}