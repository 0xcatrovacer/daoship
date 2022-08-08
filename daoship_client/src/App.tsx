import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter, GlowWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

import './App.css';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './pages/LandingPage/LandingPage';

require("@solana/wallet-adapter-react-ui/styles.css");

const network = WalletAdapterNetwork.Devnet;

function App() {
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [
        new PhantomWalletAdapter(),
        new GlowWalletAdapter(),
        new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <div className="App">
          <Navbar />
          <LandingPage />
        </div>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
