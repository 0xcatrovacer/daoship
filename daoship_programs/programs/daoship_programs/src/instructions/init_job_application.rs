use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct InitJobApplication<'info> {
    #[account(
        init,
        seeds=[
            b"job-application",
            job.key().as_ref(),
            user.key().as_ref(),
        ],
        bump,
        payer=authority,
        space=JobApplication::LEN
    )]
    pub job_application: Box<Account<'info, JobApplication>>,

    #[account(mut, has_one=project, has_one=dao)]
    pub job: Box<Account<'info, Job>>,

    #[account(mut)]
    pub project: Box<Account<'info, Project>>,

    #[account(mut)]
    pub dao: Box<Account<'info, Dao>>,

    #[account(
        mut,
        seeds=[b"user", authority.key().as_ref()],
        bump=user.bump
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<InitJobApplication>, resume: String) -> Result<()> {
    let job_application = &mut ctx.accounts.job_application;
    let job = &mut ctx.accounts.job;
    let user = &mut ctx.accounts.user;

    job_application.job = job.key();
    job_application.project = ctx.accounts.project.key();
    job_application.user = user.key();
    job_application.ts = ctx.accounts.clock.unix_timestamp;
    job_application.resume = resume;
    job_application.application_status = JobStatus::NoUpdate;
    job_application.bump = *ctx.bumps.get("job_application").unwrap();

    user.jobs_applied += 1;

    job.applications += 1;

    Ok(())
}