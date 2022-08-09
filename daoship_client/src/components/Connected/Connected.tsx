import React, { useState } from 'react'
import NotRegistered from '../NotRegistered/NotRegistered';
import OnboardOption from '../OnboardOption/OnboardOption';

function Connected() {
  const [displayType, setDisplayType] = useState('not_registered');

  return (
    <div>
        {displayType == 'not_registered' && <NotRegistered setDisplayType={setDisplayType} />}
        {displayType == 'onboarding' && <OnboardOption setDisplayType={setDisplayType} />}
    </div>
  )
}

export default Connected