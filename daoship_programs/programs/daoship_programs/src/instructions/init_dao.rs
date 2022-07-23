use crate::{errors::ErrorCode, state::*};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct InitDao<'info> {
    #[account(init, payer = authority, space = Dao::LEN)]
    pub dao: Account<'info, Dao>,

    #[account(mut)]
    pub dao_vault_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = dao_vault_token_account.mint == dao_vault_mint.key()
    )]
    pub dao_vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitDao>, name: String, img_link: String) -> Result<()> {
    let dao = &mut ctx.accounts.dao;

    if dao.name.chars().count() > 30 {
        return Err(ErrorCode::NameTooLong.into());
    }

    if img_link.chars().count() > 50 {
        return Err(ErrorCode::LinkTooLong.into());
    }

    dao.name = name;
    dao.img_link = img_link;
    dao.authority = *ctx.accounts.authority.key;
    dao.dao_vault = ctx.accounts.dao_vault_token_account.key();
    dao.vault_mint = ctx.accounts.dao_vault_mint.key();
    dao.whitelisted_projects = 0;
    dao.available_jobs = 0;
    dao.completed_hirings = 0;
    dao.available_bounites = 0;
    dao.completed_bounties = 0;
    dao.is_whitelisted = false;

    Ok(())
}
