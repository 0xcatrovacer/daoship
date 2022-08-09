import { useWallet } from '@solana/wallet-adapter-react'
import Connected from '../components/Connected/Connected';
import NotConnected from '../components/NotConnected/NotConnected'

function LandingPage() {

  const wallet = useWallet();

  return (
    <span>
      {!wallet.connected && <NotConnected />}
      {wallet.connected && <Connected />}
    </span>
  )
}

export default LandingPage