use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct InitProject<'info> {
    #[account(
        init,
        seeds=[b"project", authority.key().as_ref()],
        bump,
        payer=authority,
        space=Project::LEN
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub project_vault_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = project_vault_token_account.mint == project_vault_mint.key()
    )]
    pub project_vault_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitProject>, name: String, img_link: String) -> Result<()> {
    let project = &mut ctx.accounts.project;

    if name.chars().count() > 30 {
        return Err(ErrorCode::NameTooLong.into());
    }

    if img_link.chars().count() > 50 {
        return Err(ErrorCode::LinkTooLong.into());
    }

    project.name = name;
    project.img_link = img_link;
    project.authority = *ctx.accounts.authority.key;
    project.project_vault = ctx.accounts.project_vault_token_account.key();
    project.vault_mint = ctx.accounts.project_vault_mint.key();
    project.reputation = 0;
    project.available_jobs = 0;
    project.completed_hirings = 0;
    project.available_bounties = 0;
    project.completed_hirings = 0;
    project.bump = *ctx.bumps.get("project").unwrap();

    Ok(())
}
