import React, { Fragment } from 'react'
import ImageFb from '../../elements/ui/ImageFb';

const GalaMembers = () => {
    const values = [
        {
            id: 1,
            name: 'Dimitar Dimov',
            title: '',
            question: '',
            answer: '',
        },
        {
            id: 2,
            name: 'Ivo Stoyanov',
            title: '',
            question: '',
            answer: '',
        },
        {
            id: 3,
            name: 'Nedelcho Ninov',
            title: '',
            question: '',
            answer: '',
        },
        {
            id: 4,
            name: 'Simeon Simeonov',
            title: '',
            question: '',
            answer: '',
        },
        {
            id: 5,
            name: 'Tsveta Boneva',
            title: '',
            question: '',
            answer: '',
        },
        {
            id: 6,
            name: 'Anna-Maria Schitsova',
            title: '',
            question: '',
            answer: '',
        },
        {
            id: 7,
            name: 'Stilyan Radev',
            title: '',
            question: '',
            answer: '',
        },
        {
            id: 8,
            name: 'Stella Mihailova',
            title: '',
            question: '',
            answer: '',
        },
    ];

    return <div className='container committee_container'>
        {values.map((value) => {
            return (<div key={value.id} className={`${value.id % 2 === 0 ? 'committee_member_left' : 'committee_member_right'}`}>
                <ImageFb src={`/assets/images/team/gala/${value.id}.jpg`} fallback={`/assets/images/team/gala/${value.id}.jpg`} alt='Artist' />
                <div className='text'>
                    <div className='name'>
                        <h3 className='mr--5'>{value.name}</h3>
                        <h4>{value.title}</h4>
                    </div>
                    <p>{value.question}</p>
                    <p>{value.answer}</p>
                </div>
            </div>)
        })}
    </div>
}

export default GalaMembers