import React from 'react'
import { yearsSinceBirthday } from '../../util/functions/date'

const BirthdayBanner = ({ birth, name }) => {
  return (
    <div className="team_member_border_2 center_section" style={{ maxWidth: '500px', margin: '0 auto 20px', padding: '10px' }} >
      <p className="center_text">
        Happy {yearsSinceBirthday(birth)} years on this planet, {name}! We wish you a very special celebration!
      </p>
    </div>
  )
}

export default BirthdayBanner