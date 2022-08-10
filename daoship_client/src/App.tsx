import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    GlowWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
    clusterApiUrl,
    ConfirmOptions,
    Connection,
    PublicKey,
} from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@project-serum/anchor";
import { Provider, useEffect, useMemo, useState } from "react";

import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import LandingPage from "./pages/LandingPage";
import idl from "./idls/daoship.json";

require("@solana/wallet-adapter-react-ui/styles.css");

declare const window: any;

const network = WalletAdapterNetwork.Devnet;

const networkUrl = "https://api.devnet.solana.com";

const programID = new PublicKey(idl.metadata.address);
const opts = {
    preflightCommitment: "processed",
};

function App() {
    const [web3Program, setProgram] = useState<Program>();
    const [web3Provider, setProvider] = useState<AnchorProvider>();
    const [newConnection, setConnection] = useState<Connection>();

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SolflareWalletAdapter({ network }),
        ],
        [network]
    );

    const getProvider = () => {
        const connection = new Connection(networkUrl);
        const provider = new AnchorProvider(
            connection,
            window.solana || null,
            opts.preflightCommitment as ConfirmOptions
        );

        setConnection(connection);
        return provider;
    };

    const callFn = () => {
        try {
            const provider = getProvider();

            const program = new Program(idl as Idl, programID, provider);
            setProvider(provider);
            console.log(provider);
            setProgram(program);
            console.log(program);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        callFn();
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <div className="App">
                    <Navbar />
                    <LandingPage
                        program={web3Program as Program}
                        provider={web3Provider as AnchorProvider}
                    />
                </div>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
