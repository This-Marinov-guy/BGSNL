import React from 'react'

const EventCard2 = () => {
  return (
      <div className="col-lg-4 col-md-4 mt--30">
          <div className="standard-service">
              <div className="thumbnai">
                  <img
                      src={'https://images.freeimages.com/images/large-previews/60a/rabits-1561799.jpg'}
                      alt="Corporate Images"
                  />
              </div>
              <div className="content">
                  <h3>
                      <a href="/service-details">Wahts upp</a>
                  </h3>
                  <p>alalal lalal alalalala</p>
                  <a
                      className="btn-transparent rn-btn-dark"
                      href="/service-details"
                  >
                      <span className="text">Read More</span>
                  </a>
              </div>
          </div>
      </div>
  )
}

export default EventCard2