use anchor_lang::prelude::*;

use crate::{state::*, errors::ErrorCodes};

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(
        init,
        seeds = [b"user", authority.key().as_ref()],
        bump,
        payer = authority,
        space = User::LEN
    )]
    pub user: Box<Account<'info, User>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitUser>, name: String, bio: String) -> Result<()> {
    let user = &mut ctx.accounts.user;

    if name.chars().count() > 30 {
        return Err(ErrorCodes::NameTooLong.into());
    }

    if bio.chars().count() > 50 {
        return Err(ErrorCodes::BioTooLong.into());
    }

    user.display_name = name;
    user.authority = *ctx.accounts.authority.key;
    user.bio = bio;
    user.reputation = 0;
    user.completed_bounties = 0;
    user.bump = *ctx.bumps.get("user").unwrap();

    Ok(())
}