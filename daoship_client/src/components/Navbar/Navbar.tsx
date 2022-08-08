import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import './Navbar.css'

function Navbar() {
  return (
    <div className='navbar__container'>
        <div className="navbar__logo">
            DAOSHIP
        </div>
        <div className="navbar__right">
            <div className="navbar__links">
                <span className='navbar__link'>Twitter</span>
                <span className='navbar__link'>Discord</span>
                <span className='navbar__link'>Documentation</span>
            </div>
            <div className='navbar__connectcontainer'>
                <WalletModalProvider>
                    <WalletMultiButton className='navbar__connectbutton' />
                </WalletModalProvider>
            </div>
        </div>
    </div>
  )
}

export default Navbar