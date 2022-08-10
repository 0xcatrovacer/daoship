import { useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@project-serum/anchor";
import Connected from "../components/Connected/Connected";
import NotConnected from "../components/NotConnected/NotConnected";

type LandingPageProps = {
    program: Program;
    provider: AnchorProvider;
};

function LandingPage({ program, provider }: LandingPageProps) {
    const wallet = useWallet();

    return (
        <span>
            {!wallet.connected && <NotConnected />}
            {wallet.connected && (
                <Connected program={program} provider={provider} />
            )}
        </span>
    );
}

export default LandingPage;
