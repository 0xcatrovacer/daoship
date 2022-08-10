import React from 'react'

type OnboardMainProps = {
    setOnboardType: (onboardType: string) => void;
}

function OnboardMain(props: OnboardMainProps) {
  return (
    <div className="onboard__container">
        <div className="onboard__choice">
            <div className="ob__text">
                Create your DAO Account where you can whitelist projects so that they<br />can post jobs and bounties for your DAO members!
            </div>
            <button className="ob__button" onClick={() => props.setOnboardType('onboard_dao')}>Onboard as DAO</button>
        </div>

        <div className="onboard__choice">
            <div className="ob__text">
                Create a Project Account to post Job & Bounty listings<br />for Solana Devs on DAO Pages!
            </div>
            <button className="ob__button"  onClick={() => props.setOnboardType('onboard_project')}>Onboard as Project</button>
        </div>

        <div className="onboard__choice">
            <div className="ob__text">
                Create a Developer Account to earn in web3 through jobs and bounties!
            </div>
            <button className="ob__button"  onClick={() => props.setOnboardType('onboard_developer')}>Onboard as Developer</button>
        </div>
    </div>
  )
}

export default OnboardMain