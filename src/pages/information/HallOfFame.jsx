import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import { Dialog } from "primereact/dialog";

// Styled borders based on tier - using SVG files from alumni directory
const tierBorders = {
  platinum: {
    borderImage: "none",
    className: "border-platinum",
    size: "180px",
    borderWidth: "0",
    svgPath: "assets/images/svg/alumni/tier-1.svg"
  },
  gold: {
    borderImage: "none",
    className: "border-gold",
    size: "160px",
    borderWidth: "0",
    svgPath: "assets/images/svg/alumni/tier-2.svg"
  },
  silver: {
    borderImage: "none",
    className: "border-silver",
    size: "140px",
    borderWidth: "0",
    svgPath: "assets/images/svg/alumni/tier-3.svg"
  },
  bronze: {
    borderImage: "none",
    className: "border-bronze",
    size: "120px",
    borderWidth: "0",
    svgPath: "assets/images/svg/alumni/tier-4.svg"
  },
  standard: {
    borderImage: "none",
    className: "border-standard",
    size: "100px",
    borderWidth: "0",
    svgPath: "assets/images/svg/alumni/tier-4.svg" // Using tier-4 for standard as well
  }
};

// Sample data structure (replace with actual API data in production)
const sampleUsers = [
  {
    id: 1,
    name: "John Doe",
    avatar: "/assets/images/avatars/bg_other_avatar_1.jpeg",
    tier: "platinum",
    quote: "Proud to support this amazing community that has given me so much!",
    joinDate: "2020-01-15"
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "/assets/images/avatars/bg_other_avatar_2.jpeg",
    tier: "gold",
    quote: "Being part of this alumni network has opened countless doors.",
    joinDate: "2020-03-22"
  },
  {
    id: 3,
    name: "Michael Johnson",
    avatar: "/assets/images/team/1.jpg",
    tier: "gold",
    quote: "The connections I've made here are priceless.",
    joinDate: "2020-05-10"
  },
  {
    id: 4,
    name: "Emily Williams",
    avatar: "/assets/images/team/2.jpg",
    tier: "silver",
    quote: "So grateful for this wonderful community.",
    joinDate: "2021-01-05"
  },
  {
    id: 5,
    name: "Robert Brown",
    avatar: "/assets/images/team/3.jpg",
    tier: "silver",
    quote: "Proud member since day one!",
    joinDate: "2021-02-18"
  },
  {
    id: 6,
    name: "Sarah Davis",
    avatar: "/assets/images/team/1.jpg",
    tier: "bronze",
    joinDate: "2021-07-30"
  },
  {
    id: 7,
    name: "Thomas Wilson",
    avatar: "/assets/images/team/2.jpg",
    tier: "bronze",
    joinDate: "2021-09-12"
  },
  {
    id: 8,
    name: "Lisa Anderson",
    avatar: "/assets/images/team/3.jpg",
    tier: "bronze",
    joinDate: "2021-10-05"
  },
  {
    id: 9,
    name: "David Martinez",
    avatar: "/assets/images/team/1.jpg",
    tier: "standard",
    joinDate: "2022-01-20"
  },
  {
    id: 10,
    name: "Jennifer Taylor",
    avatar: "/assets/images/team/2.jpg",
    tier: "standard",
    joinDate: "2022-03-15"
  }
];

const UserAvatar = ({ user, onClick, className }) => {
  const tierStyle = tierBorders[user.tier];
  
  return (
    <motion.div
      className={`hall-of-fame-avatar ${className || ""}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      style={{
        cursor: user.quote ? "pointer" : "default"
      }}
    >
      <div
        className={`avatar-container ${tierStyle.className}`}
        style={{
          width: tierStyle.size,
          height: tierStyle.size,
          position: "relative",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {/* SVG Border */}
        <div style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
          zIndex: 1,
          pointerEvents: "none" // Ensures clicks pass through to the avatar
        }}>
          <img 
            src={tierStyle.svgPath} 
            alt="" 
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}
            />
        </div>
        
        {/* User Avatar */}
        <div style={{
          width: "68%",
          height: "68%",
          overflow: "hidden",
          borderRadius: "50%",
          position: "relative",
          zIndex: 0,
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          backgroundColor: "#fff"
        }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        </div>
      </div>
      <h5 className="mt--20 text-center">{user.name}</h5>
      {(user.tier === "platinum" || user.tier === "gold") && (
        <span className="membership-badge" style={{
          background: user.tier === "platinum" ? "#e5e4e2" : "#FFD700",
          color: "#333",
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "12px",
          display: "inline-block",
          marginTop: "5px"
        }}>
          {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Member
        </span>
      )}
    </motion.div>
  );
};

const HallOfFame = () => {
  const { loading } = useHttpClient(); // sendRequest will be used when API integration is implemented
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Replace with actual API call to fetch users
    // const fetchUsers = async () => {
    //   try {
    //     const response = await sendRequest("hall-of-fame/users", "GET");
    //     setUsers(response.users);
    //   } catch (err) {
    //     console.error("Error fetching hall of fame users:", err);
    //   }
    // };
    // fetchUsers();
    
    // Using sample data for now
    setUsers(sampleUsers);
  }, []);

  const handleUserClick = (user) => {
    if (user.quote) {
      setSelectedUser(user);
      setVisible(true);
    }
  };

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Hall of Fame" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      
      {/* Start Breadcrump Area */}
      <div className="rn-page-title-area pt--120 pb--190 bg_image bg_image--15" data-black-overlay="6">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rn-page-title text-center pt--100">
                <h2 className="title theme-gradient">Hall of Fame</h2>
                <p>Our esteemed alumni members who make our society exceptional</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Breadcrump Area */}
      
      {/* Start Hall of Fame Area */}
      <div className="rn-alumni-area mt--100 rn-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb--30">
                <h3 className="title">Alumni Tree</h3>
                <p className="description">
                  Our alumni members are arranged by their membership tier. <br/>
                  Click on premium members to read their inspiring quotes.
                </p>
              </div>
            </div>
          </div>
          
          {loading ? (
            <Loader />
          ) : (
            <div className="hall-of-fame-tree">
              {/* Platinum Tier */}
              <div className="row platinum-tier-row justify-content-center mb--60">
                {users
                  .filter(user => user.tier === "platinum")
                  .map(user => (
                    <div key={user.id} className="col-lg-4 col-md-6 col-12">
                      <UserAvatar 
                        user={user} 
                        onClick={() => handleUserClick(user)}
                        className="platinum-connection"
                      />
                    </div>
                  ))}
              </div>
              
              {/* Gold Tier */}
              <div className="row gold-tier-row justify-content-center mb--60">
                {users
                  .filter(user => user.tier === "gold")
                  .map(user => (
                    <div key={user.id} className="col-lg-3 col-md-4 col-sm-6 col-12">
                      <UserAvatar 
                        user={user} 
                        onClick={() => handleUserClick(user)}
                        className="gold-connection"
                      />
                    </div>
                  ))}
              </div>
              
              {/* Silver Tier */}
              <div className="row silver-tier-row justify-content-center mb--60">
                {users
                  .filter(user => user.tier === "silver")
                  .map(user => (
                    <div key={user.id} className="col-lg-2 col-md-3 col-sm-6 col-12">
                      <UserAvatar 
                        user={user} 
                        onClick={() => handleUserClick(user)}
                        className="silver-connection"
                      />
                    </div>
                  ))}
              </div>
              
              {/* Bronze Tier */}
              <div className="row bronze-tier-row justify-content-center mb--60">
                {users
                  .filter(user => user.tier === "bronze")
                  .map(user => (
                    <div key={user.id} className="col-lg-2 col-md-3 col-sm-4 col-12">
                      <UserAvatar 
                        user={user} 
                        onClick={() => handleUserClick(user)}
                        className="bronze-connection"
                      />
                    </div>
                  ))}
              </div>
              
              {/* Standard Tier */}
              <div className="row standard-tier-row justify-content-center">
                {users
                  .filter(user => user.tier === "standard")
                  .map(user => (
                    <div key={user.id} className="col-lg-2 col-md-3 col-sm-4 col-6">
                      <UserAvatar 
                        user={user} 
                        onClick={() => handleUserClick(user)}
                        className="standard-connection"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* End Hall of Fame Area */}
      
      {/* Quote Dialog */}
      <Dialog 
        header={selectedUser?.name}
        visible={visible} 
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        {selectedUser && (
          <div className="quote-dialog">
            <div className="d-flex align-items-center mb--20">
              <div style={{ width: "80px", height: "80px", overflow: "hidden", borderRadius: "50%", marginRight: "20px" }}>
                <img 
                  src={selectedUser.avatar} 
                  alt={selectedUser.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h4>{selectedUser.name}</h4>
                <p style={{ margin: 0 }}>{selectedUser.tier.charAt(0).toUpperCase() + selectedUser.tier.slice(1)} Member</p>
              </div>
            </div>
            
            <div className="quote-container p--30 mb--20" style={{
              background: "#f9f9f9",
              borderLeft: `4px solid ${selectedUser.tier === "platinum" ? "#e5e4e2" : "#FFD700"}`,
              borderRadius: "4px"
            }}>
              <blockquote className="mb-0">
                &ldquo;{selectedUser.quote}&rdquo;
              </blockquote>
            </div>
            
            <p className="text-right">Member since {new Date(selectedUser.joinDate).toLocaleDateString()}</p>
          </div>
        )}
      </Dialog>
      
      <FooterTwo />
      
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

// PropTypes for the UserAvatar component
UserAvatar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    tier: PropTypes.oneOf(["platinum", "gold", "silver", "bronze", "standard"]).isRequired,
    quote: PropTypes.string,
    joinDate: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default HallOfFame;