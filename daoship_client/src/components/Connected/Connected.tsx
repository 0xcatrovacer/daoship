import React, { useState } from 'react'
import NotRegistered from '../NotRegistered/NotRegistered';

function Connected() {
  const [displayType, setDisplayType] = useState('not_registered');

  return (
    <div>
        {displayType == 'not_registered' && <NotRegistered setDisplayType={setDisplayType} />}
    </div>
  )
}

export default Connected