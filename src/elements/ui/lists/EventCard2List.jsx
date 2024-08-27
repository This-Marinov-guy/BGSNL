import React from "react";
import EventCard2 from "../cards/EventCard2";

const EventCard2List = () => {
    const starndardService = [
        {
            image: "01",
            title: "Thinking Development",
            description: "I throw myself down among the tall grass by the stream",
        },
        {
            image: "02",
            title: "Business Consulting",
            description: "I throw myself down among the tall grass by the stream",
        },
        {
            image: "03",
            title: "Biseness Development",
            description: "I throw myself down among the tall grass by the stream",
        },
    ];

    return <div className="rn-featured-service-area pt--90 pb--120 bg_color--5">
        <div className="container">
            <div className="row">
                {/* Start Single Service  */}
                <div className="col-lg-3 col-md-6 col-12 mt--30">
                    <div className="section-title">
                        <h2 className="title">Services</h2>
                        <p>
                            There are many variations of passages of Lorem Ipsum
                            available, but.
                        </p>
                        <div className="service-btn">
                            <a className="btn-transparent rn-btn-dark" href="/service">
                                <span className="text">Request Custom Service</span>
                            </a>
                        </div>
                    </div>
                </div>
                {/* End Single Service  */}

                {/* Start Single Service  */}
                <div className="col-lg-9">
                    <div className="row">
                        {starndardService.map((value, index) => (
                            <EventCard2 key={index} />
                        ))}
                    </div>
                </div>
                {/* End Single Service  */}
            </div>
        </div>
    </div>
}

export default EventCard2List;
