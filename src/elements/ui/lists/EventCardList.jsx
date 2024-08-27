import React from 'react'
import PortfolioList2 from '../../portfolio/PortfolioList2'

const target = [
    {
        image: 'https://images.freeimages.com/images/large-previews/60a/rabits-1561799.jpg',
        category: 'Development',
        title: 'Getting tickets to the big show'
    },
    {
        image: 'https://images.freeimages.com/images/large-previews/60a/rabits-1561799.jpg',
        category: 'Development',
        title: 'Getting tickets to the big show'
    }, {
        image: 'https://images.freeimages.com/images/large-previews/60a/rabits-1561799.jpg',
        category: 'Development',
        title: 'Getting tickets to the big show'
    }, {
        image: 'https://images.freeimages.com/images/large-previews/60a/rabits-1561799.jpg',
        category: 'Development',
        title: 'Getting tickets to the big show'
    },
]
const EventCardList = () => {
    return (
        <div className="row">
            <PortfolioList2
                target={target}
                styevariation="text-center mt--40"
                column="col-lg-3 col-md-4 col-sm-6 col-12"
                item="6"
            />
        </div>
    )
}

export default EventCardList