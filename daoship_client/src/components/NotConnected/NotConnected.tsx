import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import './NotConnected.css';

function NotConnected() {
  return (
    <div className="notconnected__container">
        <div className="notconnected__hero">
        <div className="notconnected__herotext">GET ACCESS TO</div>
        <div className="notconnected__herotext">BOUNTIES AND JOBS</div>
        <div className="notconnected__herotext">ON SOLANA</div>
        </div>

        <div className="notconnected__connectbuttoncont">
        <WalletModalProvider>
            <WalletMultiButton className='notconnected__connectbutton' />
        </WalletModalProvider>
        </div>
  </div>
  )
}

export default NotConnected