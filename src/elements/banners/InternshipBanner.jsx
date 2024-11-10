import React from 'react'
import { Message } from "primereact/message";
import { Link } from 'react-router-dom'

const InternshipBanner = () => {
    return (
      <div className='bottom-advert'>
        <Message
          severity="info"
          className="center_div mt--20"
          content={
            <>
                <p>Fancy an entry-level job or an internships? <Link to='/user#internships'> Check out our suggestion!</Link></p>
            </>
          }
        />
      </div>
    );
}

export default InternshipBanner