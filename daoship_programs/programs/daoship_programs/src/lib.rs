use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod daoship_programs {
    use super::*;

    pub fn init_dao(ctx: Context<InitDao>, name: String, img_link: String) -> Result<()> {
        instructions::init_dao::handler(ctx, name, img_link)
    }
}
