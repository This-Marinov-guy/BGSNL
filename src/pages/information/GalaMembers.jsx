import React, { useEffect, useRef, useState } from 'react'
import ImageFb from '../../elements/ui/ImageFb';
import { Dialog } from 'primereact/dialog';
import { Link } from 'react-router-dom';
import { ARTISTS } from '../../util/defines/ARTISTS.js';
import { FiMic, FiMusic } from 'react-icons/fi';

const GalaMembers = () => {
    const [display, setDisplay] = useState(false)
    const campaignRef = useRef(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const campaignQuery = searchParams.get('campaign');

        if (campaignQuery === 'artists') {
            campaignRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [])

    return <>
        <Dialog header={`Meet ${display.name}`} visible={display} onHide={() => setDisplay(false)} dismissableMask
            style={{ minWidth: '60vw', marginRight: '5px', marginLeft: '5px' }}>
            <div className="contact-form--1">
                <div className="row">
                    <div className='col-lg-6 col-12'>
                        <ImageFb style={{ maxHeight: '200px', marginBottom: '10px' }} src={`/assets/images/team/gala/${display.id}.jpg`} fallback={`/assets/images/team/gala/${display.id}.jpg`} alt='Artist' />
                    </div>
                    <div className='col-lg-6 col-12'>
                        <h4>Specialty: {display.title}</h4>
                        <h4>Age: {display.age}</h4>
                        <h4>City: {display.town}</h4>
                    </div>
                </div>
                <hr className='mt--20' />
                {display.description && display.description.map((v, index) => {
                    return <div div key={index} >
                        <h4 className='mt--40'>{v.question}</h4>
                        <p>- {v.answer}</p>
                    </div>

                })}
            </div>
        </Dialog>
        <h2 ref={campaignRef} className='center_text'>Meet the artists</h2>
        <div className='container committee_container mb--20'>
            {ARTISTS.map((value) => {
                return (<div key={value.id} className={`${value.id % 2 === 0 ? 'committee_member_left' : 'committee_member_right'}`}>
                    <ImageFb style={{ objectFit: 'cover',borderRadius: '50%', width: '150px', height: '150px' }} onClick={() => setDisplay(value)} src={`/assets/images/team/gala/${value.id}.jpg`} fallback={`/assets/images/team/gala/${value.id}.jpg`} alt='Artist' />
                    <div className='text'>
                        <div className='name'>
                            <h3 className='mr--5'>{value.name} |</h3>
                            <h4>{value.title}</h4>
                        </div>
                        <Link style={{ fontSize: '20px' }} onClick={() => setDisplay(value)} to='#'>Click me <FiMusic /></Link>
                    </div>
                </div>)
            })}
        </div>
    </>
}

export default GalaMembers