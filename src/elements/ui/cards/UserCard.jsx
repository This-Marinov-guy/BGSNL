import React from 'react'
import { showModal } from "../../../redux/modal";
import { FiCircle, FiCheckCircle, FiEdit } from "react-icons/fi";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { REGION_WHATSAPP } from "../../../util/defines/REGIONS_DESIGN";
import { useDispatch } from 'react-redux';

const UserCard = ({ user }) => {
    const dispatch = useDispatch();

    return (
        <div className="service service__style--2 team_member_border-5">
            <div className="content">
                <h2>Hello again, {user.name}!</h2>
                <div className="hor_section mb--40">
                    <p className="mt--20" style={{ fontFamily: 'Archive' }}>{capitalizeFirstLetter(user.region)} Member</p>
                    <FiEdit
                        className="edit_btn"
                        onClick={() => {
                            dispatch(showModal());
                        }}
                    />
                </div>
                <div className="pricing-body">
                    <ul
                        style={{ textAlign: "start" }}
                        className="list-style--1"
                    >
                        <li>
                            <FiCircle style={{ fontSize: "14px" }} /> Full Name:{" "}
                            {user.name + " " + user.surname}
                        </li>
                        <li>
                            <FiCircle style={{ fontSize: "14px" }} /> Date of Birth:{" "}
                            {user.birth}
                        </li>
                        <li>
                            <FiCircle style={{ fontSize: "14px" }} /> Email:{" "}
                            {user.email}
                        </li>
                        <li>
                            <FiCircle style={{ fontSize: "14px" }} /> Phone:{" "}
                            {user.phone}
                        </li>
                        <li>
                            <FiCircle style={{ fontSize: "14px" }} /> University:{" "}
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