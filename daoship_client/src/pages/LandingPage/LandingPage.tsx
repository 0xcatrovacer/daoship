import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import './LandingPage.css'

function LandingPage() {
  return (
    <div className="landing__container">
      <div className="landing__hero">
        <div className="landing__herotext">GET ACCESS TO</div>
        <div className="landing__herotext">BOUNTIES AND JOBS</div>
        <div className="landing__herotext">ON SOLANA</div>
      </div>

      <div className="landing__connectbuttoncont">
        <WalletModalProvider>
          <WalletMultiButton className='landing__connectbutton' />
        </WalletModalProvider>
      </div>
    </div>
  )
}

export default LandingPage