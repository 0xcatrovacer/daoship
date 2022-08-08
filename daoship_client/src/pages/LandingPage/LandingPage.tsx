import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import NotConnected from '../../components/NotConnected/NotConnected'
import './LandingPage.css'

function LandingPage() {
  return (
    <NotConnected />
  )
}

export default LandingPage