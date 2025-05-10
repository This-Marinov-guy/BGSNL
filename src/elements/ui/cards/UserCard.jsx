import React from 'react'
import { showModal } from "../../../redux/modal";
import { FiCircle, FiCheckCircle, FiEdit } from "react-icons/fi";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { REGION_WHATSAPP } from "../../../util/defines/REGIONS_DESIGN";
import { useDispatch } from 'react-redux';
import { USER_UPDATE_MODAL, formatRole } from '../../../util/defines/common';
import moment from 'moment';
import SubscriptionManage from '../buttons/SubscriptionManage';
import { isProd } from '../../../util/functions/helpers';

const UserCard = ({ user }) => {
    const dispatch = useDispatch();

    return (
      <div className="service gradient-border-2 mt--20">
        {/* <h2 className='archive-title' >Greetings, {user.name}!</h2> */}
        <div className="hor_section mb--10">
          <p className="mt--10" style={{ fontFamily: "Archive" }}>
            {capitalizeFirstLetter(user.region)} <br /> {formatRole(user.roles)}{" "}
          </p>
          <FiEdit
            className="edit_btn"
            onClick={() => {
              dispatch(showModal(USER_UPDATE_MODAL));
            }}
          />
        </div>
        <div className="pricing-body">
          <ul style={{ textAlign: "start" }} className="list-style--1">
            <li>
              <span className="bold">Full Name: </span>
              {user.name + " " + user.surname}
            </li>
            <li>
              <span className="bold">Date of Birth: </span>
              {moment(user.birth).format("D MMM YYYY")}
            </li>
            <li>
              <span className="bold">Email: </span>
              {user.email}
            </li>
            <li>
              <span className="bold">Phone: </span>
              {user.phone}
            </li>
            <li>
              <span className="bold">University: </span>
              {user.university === "other"
                ? user.otherUniversityName
                : user.university}
            </li>

            {/* <li style={{ fontWeight: "bold" }}>
                        <FiCircle style={{ fontSize: "14px" }} /> Membership
                        Expires: {user.expireDate}
                      </li> */}
            {REGION_WHATSAPP[user.region] && (
              <li>
                <FiCheckCircle style={{ fontSize: "14px" }} />
                <a
                  style={{ color: "#017363" }}
                  href={REGION_WHATSAPP[user.region]}
                  target="_blank"
                >
                  Click here to join the Member Chat
                </a>
              </li>
            )}
          </ul>
          {!isProd() || user.subscription ? (
            <SubscriptionManage
              userId={user.id}
              subscription={user.subscription}
            />
          ) : (
            <div className="mt--60" />
          )}
        </div>
      </div>
    );
}

export default UserCard