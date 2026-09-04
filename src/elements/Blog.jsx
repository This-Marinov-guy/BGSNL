import React, { Component } from "react";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import PageHelmet from "../component/common/Helmet";
import Footer from "../component/footer/Footer";
import Header from "../component/header/Header";
import BlogList from "../elements/blog/BlogList";
import Breadcrumb from "../elements/common/Breadcrumb";

class Blog extends Component{
    render(){
        return(
            <React.Fragment>
                <PageHelmet pageTitle='Blog' />

                <Header headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />
                <Breadcrumb
                    title="Articles"
                    description="Stories, interviews, and practical guides from Bulgarians living and studying in the Netherlands."
                />


                {/* Start Blog Area */}
                <div className="rn-blog-area ptb--120 bg_color--1">
                    <div className="container">
                        <BlogList />
                    </div>
                </div>
                {/* End Blog Area */}
                
                {/* Start Back To Top */}
                <div className="backto-top">
                    <ScrollToTop showUnder={160}>
                        <FiChevronUp size={26} />
                    </ScrollToTop>
                </div>
                {/* End Back To Top */}
                
                <Footer /> 

            </React.Fragment>
        )
    }
}
export default Blog;
