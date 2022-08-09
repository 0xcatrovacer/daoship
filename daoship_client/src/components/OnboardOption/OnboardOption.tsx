import { useState } from 'react'
import OnboardDao from './OnboardDao'
import OnboardDev from './OnboardDev'
import OnboardMain from './OnboardMain'
import './OnboardOption.css'
import OnboardProject from './OnboardProject'

type OnboardOptionProps = {
    setDisplayType: (displayType: string) => void
}

function OnboardOption(props: OnboardOptionProps) {
  const [onboardType, setOnboardType] = useState('onboard_main')

  return (
    <span>
        {onboardType == 'onboard_main' && <OnboardMain setOnboardType={setOnboardType} />}
        {onboardType == 'onboard_dao' && <OnboardDao />}
        {onboardType == 'onboard_project' && <OnboardProject />}
        {onboardType == 'onboard_developer' && <OnboardDev />}
    </span>
  )
}

export default OnboardOption