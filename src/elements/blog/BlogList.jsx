import React, { Component ,Fragment } from "react";
import { Link } from "react-router-dom";
import BlogContent from "./BlogContent";

class BLogList extends Component{
    render() {
        const PostList = BlogContent.slice(0 , 6);
        return (
             <Fragment>
                 <div className="row">
                    {PostList.map((value , i ) => (
                        <div className="col-lg-4 col-md-6 col-sm-6 col-12" key={i}>
                            <div className="blog blog-style--1">
                                <div className="thumbnail">
                                    <Link to="/blog-details">
                                        <img className="w-100" src={`/assets/images/blog/blog-${value.images}.jpg`} alt="Blog Images"/>
                                    </Link>
                                </div>
                                <div className="content">
                                    <p className="blogtype">{value.category}</p>
                                    <h4 className="title"><Link to="/blog-details">{value.title}</Link></h4>
                                    <div className="blog-btn">
                                        <a className="rn-btn text-white" href="/blog-details">Read More</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                     ))}
                 </div>
             </Fragment>
        );
    }
}
export default BLogList;