use anchor_lang::prelude::*;

mod constants;
mod errors;
mod instructions;
mod state;

use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

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
}
