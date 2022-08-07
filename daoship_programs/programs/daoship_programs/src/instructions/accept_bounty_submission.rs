use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Transfer, TokenAccount, Token};

use crate::{state::*, errors::ErrorCodes, constants::{ACCEPT_BOUNTY_REP, BOUNTY_ACCEPTED_REP, BOUNTY_ESCROW_PDA_SEEDS}};

#[derive(Accounts)]
pub struct AcceptBountySubmission<'info> {
    #[account(
        mut,
        seeds=[
            b"bounty-application",
            bounty.key().as_ref(),
            user.key().as_ref(),
        ],
        bump=bounty_application.bump,
    )]
    pub bounty_application: Box<Account<'info, BountyApplication>>,

    #[account(mut, has_one=project, has_one=dao)]
    pub bounty: Box<Account<'info, Bounty>>,

    #[account(
        mut,
        seeds=[b"project", authority.key().as_ref()],
        bump=project.bump
    )]
    pub project: Box<Account<'info, Project>>,

    #[account(mut)]
    pub dao: Box<Account<'info, Dao>>,

    #[account(mut)]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = token_mint.key() == bounty.bounty_vault_mint
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = bounty_vault_token_account.key() == bounty.bounty_vault_account
    )]
    pub bounty_vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.key() == bounty_application.user_token_account
    )]
    pub user_token_account: Account<'info, TokenAccount>,
        
    /// CHECK: This is not dangerous
    pub vault_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>
}

impl<'info> AcceptBountySubmission<'info> {
    fn transfer_winnings_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.bounty_vault_token_account.to_account_info().clone(),
            to: self.user_token_account.to_account_info().clone(),
            authority: self.vault_authority.clone()
        };

        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<AcceptBountySubmission>) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let dao = &mut ctx.accounts.dao;
    let user = &mut ctx.accounts.user;
    let bounty_application = &mut ctx.accounts.bounty_application;
    let bounty = &mut ctx.accounts.bounty;

    if *ctx.accounts.authority.key != project.authority {
        return Err(ErrorCodes::Unauthorized.into());
    }

    project.available_bounties -= 1;
    project.completed_bounties += 1;
    project.reputation += ACCEPT_BOUNTY_REP;
    
    dao.available_bounties -= 1;
    dao.completed_bounties += 1;
    
    user.completed_bounties += 1;
    user.reputation += BOUNTY_ACCEPTED_REP;

    bounty_application.application_status = BountyStatus::Accepted;
    
    bounty.is_completed = true;
    bounty.bounty_winner = user.key();

    let (_vault_authority, _vault_authority_bump) =
            Pubkey::find_program_address(&[&BOUNTY_ESCROW_PDA_SEEDS], ctx.program_id);

    let authority_seeds = &[&BOUNTY_ESCROW_PDA_SEEDS[..], &[_vault_authority_bump]];

    token::transfer(
        ctx.accounts
            .transfer_winnings_context()
            .with_signer(&[&authority_seeds[..]]),
        ctx.accounts.bounty.amount
    )?;

    Ok(())
}