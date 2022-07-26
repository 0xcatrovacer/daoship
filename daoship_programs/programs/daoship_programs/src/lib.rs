use anchor_lang::prelude::*;

mod constants;
mod errors;
mod instructions;
mod state;

use instructions::*;

declare_id!("CcDpgqXEcc268hstohTJW7KzswM2LkGsw9MV7aiANaR7");

#[program]
pub mod daoship_programs {
    use super::*;

    pub fn init_dao(ctx: Context<InitDao>, name: String, img_link: String) -> Result<()> {
        instructions::init_dao::handler(ctx, name, img_link)
    }

    pub fn whitelist_dao(ctx: Context<WhitelistDao>) -> Result<()> {
        instructions::whitelist_dao::handler(ctx)
    }

    pub fn init_project(ctx: Context<InitProject>, name: String, img_link: String) -> Result<()> {
        instructions::init_project::handler(ctx, name, img_link)
    }

    pub fn init_whitelist_project(ctx: Context<InitWhitelistProject>) -> Result<()> {
        instructions::init_whitelist_project::handler(ctx)
    }

    pub fn whitelist_project(ctx: Context<WhitelistProject>) -> Result<()> {
        instructions::whitelist_project::handler(ctx)
    }

    pub fn init_job_listing(ctx: Context<InitJobListing>, description: String) -> Result<()> {
        instructions::init_job_listing::handler(ctx, description)
    }

    pub fn close_job_listing(ctx: Context<CloseJobListing>) -> Result<()> {
        instructions::close_job_listing::handler(ctx)
    }

    pub fn init_bounty_listing(
        ctx: Context<InitBountyListing>,
        amount: u64,
        description: String,
    ) -> Result<()> {
        instructions::init_bounty_listing::handler(ctx, amount, description)
    }

    pub fn close_bounty_listing(ctx: Context<CloseBountyListing>) -> Result<()> {
        instructions::close_bounty_listing::handler(ctx)
    }

    pub fn init_user(ctx: Context<InitUser>, name: String, bio: String) -> Result<()> {
        instructions::init_user::handler(ctx, name, bio)
    }

    pub fn init_job_application(ctx: Context<InitJobApplication>, resume: String) -> Result<()> {
        instructions::init_job_application::handler(ctx, resume)
    }

    pub fn init_bounty_application(ctx: Context<InitBountyApplication>) -> Result<()> {
        instructions::init_bounty_application::handler(ctx)
    }

    pub fn close_bounty_application(ctx: Context<CloseBountyApplication>) -> Result<()> {
        instructions::close_bounty_application::handler(ctx)
    }

    pub fn approve_user_for_bounty(ctx: Context<ApproveUserForBounty>) -> Result<()> {
        instructions::approve_user_for_bounty::handler(ctx)
    }

    pub fn submit_bounty_for_review(ctx: Context<SubmitBountyForReview>, submission_link: String) -> Result<()> {
        instructions::submit_bounty_for_review::handler(ctx, submission_link)
    }

    pub fn accept_bounty_submission(ctx: Context<AcceptBountySubmission>) -> Result<()> {
        instructions::accept_bounty_submission::handler(ctx)
    }
}
