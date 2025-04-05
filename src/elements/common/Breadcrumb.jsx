
import React, { Component } from "react";
import { Link } from "react-router-dom";

class Breadcrumb extends Component {

    render() {
        const { title, category, parent, extraElement } = this.props;
        const imageUrl = `/assets/images/bg/bg-image-1.webp`;

        return (
            <React.Fragment>
                <div className="breadcrumb-area rn-bg-color ptb--50 bg_image" style={{ backgroundImage: `url(${imageUrl})` }}
                    data-black-overlay="6">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="breadcrumb-inner pt--100">
                                    <h2 className="title">{title}</h2>
                                    <ul className="page-list">
                                        <li className="breadcrumb-item"><Link to={`/`}>Home</Link></li>
                                        {parent ? <li className="breadcrumb-item">{parent}</li> : ''}
                                        <li className="breadcrumb-item active">{category ?? title}</li>
                                    </ul>
                                </div>
                            </div>
                            {extraElement && (
                                <div className="col-lg-12 mt--20">
                                        {extraElement}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default Breadcrumb;

