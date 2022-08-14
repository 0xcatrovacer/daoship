use anchor_lang::prelude::*;
use anchor_spl::token::spl_token::instruction::AuthorityType;
use anchor_spl::token::{self, TokenAccount, Mint, Token, Transfer, SetAuthority};

use crate::constants::{CREATE_BOUNTY_REP, BOUNTY_ESCROW_PDA_SEEDS};
use crate::state::*;
use crate::errors::ErrorCodes;

#[derive(Accounts)]
pub struct InitBountyListing<'info> {
    #[account(
        init,
        seeds=[
            b"bounty",
            dao.key().as_ref(), 
            project.key().as_ref(), 
            project.total_bounties.to_string().as_bytes(),
        ],
        bump,
        payer = authority,
        space = Bounty::LEN
    )]
    pub bounty: Box<Account<'info, Bounty>>,

    #[account(mut)]
    pub dao: Box<Account<'info, Dao>>,

    #[account(mut, has_one=authority)]
    pub project: Box<Account<'info, Project>>,
    
    #[account(
        init,
        seeds = [
            b"bounty-vault",
            dao.key().as_ref(), 
            project.key().as_ref(), 
            project.total_bounties.to_string().as_bytes(),
        ],
        bump,
        payer = authority,
        token::mint = bounty_vault_mint,
        token::authority = authority,
    )]
    pub bounty_vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub bounty_vault_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = authority_token_account.mint == bounty_vault_mint.key(),
        constraint = authority_token_account.owner == *authority.key,
    )]
    pub authority_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, has_one=project, has_one=dao)]
    pub project_whitelist: Box<Account<'info, ProjectWhitelist>>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info, Clock>,

    pub token_program: Program<'info, Token>,

    pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitBountyListing<'info> {
    fn transfer_to_vault_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.authority_token_account.to_account_info().clone(),
            to: self.bounty_vault_token_account.to_account_info().clone(),
            authority: self.authority.to_account_info().clone(),
        };

        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }

    fn set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.bounty_vault_token_account.to_account_info().clone(),
            current_authority: self.authority.to_account_info().clone(),
        };

        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<InitBountyListing>, amount: u64, description: String) -> Result<()> {
    if *ctx.accounts.authority.to_account_info().key != ctx.accounts.project.authority.key() {
        return Err(ErrorCodes::Unauthorized.into());
    }

    if ctx.accounts.project_whitelist.is_whitelisted == false {
        return Err(ErrorCodes::Unauthorized.into());
    }

    let bounty = &mut ctx.accounts.bounty;
    let project = &mut ctx.accounts.project;
    let dao = &mut ctx.accounts.dao;

    bounty.project = project.key();
    bounty.dao = dao.key();
    bounty.id = project.total_bounties;
    bounty.bounty_vault_mint = ctx.accounts.bounty_vault_mint.key();
    bounty.bounty_vault_account = ctx.accounts.bounty_vault_token_account.key();
    bounty.amount = amount;
    bounty.post_ts = ctx.accounts.clock.unix_timestamp;
    bounty.applications = 0;
    bounty.approved = 0;
    bounty.bounty_description = description;
    bounty.is_completed = false;
    bounty.bump = *ctx.bumps.get("bounty").unwrap();

    project.reputation += CREATE_BOUNTY_REP;
    project.total_bounties += 1;
    project.available_bounties += 1;
    
    dao.available_bounties += 1;

    let (vault_authority, _vault_authority_bump) = Pubkey::find_program_address(&[BOUNTY_ESCROW_PDA_SEEDS], ctx.program_id);

    token::set_authority(
        ctx.accounts.set_authority_context(), 
        AuthorityType::AccountOwner, 
        Some(vault_authority)
    )?;

    token::transfer(
        ctx.accounts.transfer_to_vault_context(), 
        amount
    )?;

    Ok(())
}