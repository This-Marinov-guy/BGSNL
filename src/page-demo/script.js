import React from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
        <button
            className="custom-arrow custom-prev-arrow"
            onClick={onClick}
            aria-label="Previous Slide"
        >
            &#10094; {/* Unicode character for left arrow */}
        </button>
    );
};

export const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
        <button
            className="custom-arrow custom-next-arrow"
            onClick={onClick}
            aria-label="Next Slide"
        >
            &#10095; {/* Unicode character for right arrow */}
        </button>
    );
};

export const presentation = {
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 800,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    arrows: false,
};

export const portfolioSlick2 = {
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    responsive: [{
        breakpoint: 800,
        settings: {
            slidesToShow: 3,
        }
    },
    {
        breakpoint: 1200,
        settings: {
            slidesToShow: 3,
        }
    },
    {
        breakpoint: 993,
        settings: {
            slidesToShow: 2,
        }
    },
    {
        breakpoint: 769,
        settings: {
            slidesToShow: 2,
        }
    },
    {
        breakpoint: 481,
        settings: {
            slidesToShow: 1,
        }
    }
]
};

export const slickDot = {
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 700,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [{
        breakpoint: 800,
        settings: {
            slidesToShow: 2,
        }
    },
    {
        breakpoint: 993,
        settings: {
            slidesToShow: 2,
        }
    },
    {
        breakpoint: 580,
        settings: {
            slidesToShow: 2,
        }
    },
    {
        breakpoint: 481,
        settings: {
            slidesToShow: 1,
        }
    }
]
};


export const slideSlick = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
    arrows: true,
    fade: true,
    easing: "fade",
    adaptiveHeight: true
};

export const innerPageDemo = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    adaptiveHeight: true,
    responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
          }
        },
        {
          breakpoint: 577,
          settings: {
            slidesToShow: 1,
          }
        },
        {
          breakpoint: 485,
          settings: {
            slidesToShow: 1,
          }
        }
    ]
};

export const testimonialActivation = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    adaptiveHeight: true,
    arrows: false,
    responsive: [
        {
            breakpoint: 992,
            settings: {
            slidesToShow: 2,
            }
        },
        {
            breakpoint: 577,
            settings: {
            slidesToShow: 1,
            }
        },
        {
            breakpoint: 485,
            settings: {
            slidesToShow: 1,
            }
        }
    ]
};

