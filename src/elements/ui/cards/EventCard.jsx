import React from 'react'

const EventCard = () => {
  return (
      <div className={`${column}`} >
          <div className={`portfolio ${styevariation}`}>
              <div className="thumbnail-inner">
                  <div className={`thumbnail ${value.image}`}></div>
                  <div className={`bg-blr-image ${value.image}`}></div>
              </div>
              <div className="content">
                  <div className="inner">
                      <p>{value.category}</p>
                      <h4><a href="/portfolio-details">{value.title}</a></h4>
                      <div className="portfolio-button">
                          <a className="rn-btn" href="/portfolio-details">View Details</a>
                      </div>
                  </div>
              </div>
              <Link className="link-overlay" to="/portfolio-details"></Link>
          </div>
      </div>
  )
}

export default EventCard