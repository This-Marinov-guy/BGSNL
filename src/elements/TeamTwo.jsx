import React, { Fragment } from 'react'
import ImageFb from './ui/ImageFb'
import { useParams } from 'react-router-dom'
import { REGION_COMMITTEE_MEMBERS } from '../util/REGIONS_STRUCTURE'

const TeamTwo = (props) => {

    const {region} = useParams()

    return (
        <Fragment>
            {(REGION_COMMITTEE_MEMBERS[region] && props.teamPhoto) && <div style={{ margin: 'auto', width: '80%' }} className='center_div'>
                <ImageFb className='team_member_border-2 mb--80' src={`/assets/images/team/${region}/${props.folder}/full.webp`} fallback={`/assets/images/team/${props.folder}/com-full.jpg`} alt='Committee' />
            </div>}
            <div className='container committee_container'>
                {REGION_COMMITTEE_MEMBERS[region] ? props.target.map((value) => {
                    return (<div key={value.id} className={`${value.id % 2 === 0 ? 'committee_member_left' : 'committee_member_right'}`}>
                        <ImageFb src={`/assets/images/team/${region}/${props.folder}/${value.id}.webp`} fallback={`/assets/images/team/${props.folder}/${value.id}.jpg`} alt='Committee Member' />
                        <div className='text'>
                            <div className='name'>
                                <h3 className='mr--5'>{value.name}</h3>
                                <h4>{value.title}</h4>
                            </div>
                            <p>{value.description}</p>
                            <p>{value.interests}</p>
                        </div>
                    </div>)
                }) : <h3>Coming soon</h3>}
            </div>
        </Fragment>
    )
}

export default TeamTwo