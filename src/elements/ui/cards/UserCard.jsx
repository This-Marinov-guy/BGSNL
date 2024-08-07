import React from 'react'
import { showModal } from "../../../redux/modal";
import { FiCircle, FiCheckCircle, FiEdit } from "react-icons/fi";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { REGION_WHATSAPP } from "../../../util/defines/REGIONS_DESIGN";
import { useDispatch } from 'react-redux';
import { USER_UPDATE_MODAL, formatRole } from '../../../util/defines/defines';

const UserCard = ({ user }) => {
    const dispatch = useDispatch();

    return (
        <div className="service team_member_border-5">
            <div className="content">
                <h2>Greetings, {user.name}!</h2>
                <div className="hor_section mb--40">
                    <p className="mt--20" style={{ fontFamily: 'Archive' }}>{capitalizeFirstLetter(user.region)} <br /> {formatRole(user.roles)} </p>
                    <FiEdit
                        className="edit_btn"
                        onClick={() => {
                            dispatch(showModal(USER_UPDATE_MODAL));
                        }}
                    />
                </div>
                <div className="pricing-body">
                    <ul
                        style={{ textAlign: "start" }}
                        className="list-style--1"
                    >
                        <li>
                            Full Name:{" "}
                            {user.name + " " + user.surname}
                        </li>
                        <li>
                            Date of Birth:{" "}
                            {user.birth}
                        </li>
                        <li>
                            Email:{" "}
                            {user.email}
                        </li>
                        <li>
                            Phone:{" "}
                            {user.phone}
                        </li>
                        <li>
                            University:{" "}
                            {user.university === "other"
                                ? user.otherUniversityName
                                : user.university}
                        </li>

                        {/* <li style={{ fontWeight: "bold" }}>
                        <FiCircle style={{ fontSize: "14px" }} /> Membership
                        Expires: {user.expireDate}
                      </li> */}
                        {REGION_WHATSAPP[user.region] && <li>
                            <FiCheckCircle style={{ fontSize: "14px" }} /><a style={{ color: "#017363" }} href={REGION_WHATSAPP[user.region]} target='_blank'>Click here to join the Member Chat</a>
                        </li>}
                    </ul>
                </div>
            </div>
        </div>)
}

export default UserCard