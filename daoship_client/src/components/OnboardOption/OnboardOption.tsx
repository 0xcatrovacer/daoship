import './OnboardOption.css'

type OnboardOptionProps = {
    setDisplayType: (displayType: string) => void
}

function OnboardOption(props: OnboardOptionProps) {
  return (
    <div className="onboard__container">
        <div className="onboard__choice">
            <div className="ob__text">
                Create your DAO Account where you can whitelist projects so that they<br />can post jobs and bounties for your DAO members!
            </div>
            <button className="ob__button">Onboard as DAO</button>
        </div>

        <div className="onboard__choice">
            <div className="ob__text">
                Create a Project Account to post Job & Bounty listings<br />for Solana Devs on DAO Pages!
            </div>
            <button className="ob__button">Onboard as Project</button>
        </div>

        <div className="onboard__choice">
            <div className="ob__text">
                Create a Developer Account to earn in web3 through jobs and bounties!
            </div>
            <button className="ob__button">Onboard as Developer</button>
        </div>
    </div>
  )
}

export default OnboardOption