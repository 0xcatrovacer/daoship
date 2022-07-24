use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer, CloseAccount};

use crate::constants::{BOUNTY_ESCROW_PDA_SEEDS, CLOSE_BOUNTY_REP};
use crate::state::*;
use crate::errors::ErrorCodes;

#[derive(Accounts)]
#[instruction(bounty_id: u64)]
pub struct CloseBountyListing<'info> {
    #[account(
        mut,
        seeds=[
            b"job",
            dao.key().as_ref(), 
            project.key().as_ref(), 
            bounty_id.to_string().as_bytes(),
        ],
        bump=bounty.bump,
        close = authority,
        has_one = dao,
        has_one = project,
    )]
    pub bounty: Account<'info, Bounty>,

    #[account(
        mut,
        constraint = bounty_vault_account.owner == *vault_authority.key,
    )]
    pub bounty_vault_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub dao: Account<'info, Dao>,

    #[account(mut, has_one=authority)]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = project_token_account.owner == *authority.key,
        constraint = project_token_account.mint == bounty.bounty_vault_mint
    )]
    pub project_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is not dangerous
    pub vault_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

impl<'info> CloseBountyListing<'info> {
    fn transfer_to_project_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.bounty_vault_account.to_account_info().clone(),
            to: self.project_token_account.to_account_info().clone(),
            authority: self.vault_authority.clone(),
        };

        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }

    fn close_account_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.bounty_vault_account.to_account_info().clone(),
            destination: self.authority.to_account_info().clone(),
            authority: self.vault_authority.clone(),
        };

        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<CloseBountyListing>) -> Result<()> {
    if *ctx.accounts.authority.to_account_info().key != ctx.accounts.project.authority.key() {
        return Err(ErrorCodes::Unauthorized.into());
    }

    let project = &mut ctx.accounts.project;

    project.total_bounties -= 1;
    project.available_bounties -= 1;
    project.reputation += CLOSE_BOUNTY_REP;

    ctx.accounts.dao.available_bounties -= 1;

    let (_vault_authority, vault_authority_bump) = Pubkey::find_program_address(&[BOUNTY_ESCROW_PDA_SEEDS], ctx.program_id);

    let authority_seeds = &[&BOUNTY_ESCROW_PDA_SEEDS[..], &[vault_authority_bump]];

    token::transfer(
        ctx.accounts
            .transfer_to_project_context()
            .with_signer(&[&authority_seeds[..]]), 
        ctx.accounts.bounty.amount
    )?;

    token::close_account(
        ctx.accounts
            .close_account_context()
            .with_signer(&[&authority_seeds[..]])
    )?;

    Ok(())
}