import React, { useState, useEffect } from "react";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useHttpClient } from "../../hooks/common/http-hook";
import { Dialog } from "primereact/dialog";
import Tree from "../../component/userTree/Tree";
import { Link } from "react-router-dom";
import AlumniRegistrationButton from "../../elements/ui/buttons/AlumniRegistrationButton";

// Approximate skeleton of the tree shape — circles for nodes, lines for branches
function TreeSkeleton() {
  const ROOT  = [700, 510];
  const L2    = [[490, 505], [565, 372], [700, 322], [835, 372], [910, 505]];
  const L3    = [[455, 242], [558, 207], [638, 178], [762, 178], [842, 207], [945, 242]];
  const L3P   = [1, 1, 2, 2, 3, 3]; // L3[i]'s parent index in L2
  const AR    = 30; // avatar radius
  const LR    = 24; // leaf-node radius

  return (
    <div style={{ width: "100%", height: "560px" }}>
      <svg viewBox="310 140 780 460" width="100%" height="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="sk-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#c8ced3" />
            <stop offset="50%"  stopColor="#e2e6e9" />
            <stop offset="100%" stopColor="#c8ced3" />
            <animate attributeName="x1" from="-100%" to="100%" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="x2" from="0%"    to="200%" dur="1.6s" repeatCount="indefinite" />
          </linearGradient>
          <mask id="sk-mask">
            {/* Trunk */}
            <rect x={693} y={508} width={14} height={90} rx={7} fill="white" />
            {/* Root → L2 branches */}
            {L2.map(([x, y], i) => (
              <line key={i} x1={ROOT[0]} y1={ROOT[1]} x2={x} y2={y}
                stroke="white" strokeWidth={8} strokeLinecap="round" />
            ))}
            {/* L2 → L3 branches */}
            {L3.map(([x, y], i) => {
              const [px, py] = L2[L3P[i]];
              return <line key={i} x1={px} y1={py} x2={x} y2={y}
                stroke="white" strokeWidth={5} strokeLinecap="round" />;
            })}
            {/* Root node */}
            <circle cx={ROOT[0]} cy={ROOT[1]} r={AR + 2} fill="white" />
            {/* L2 nodes */}
            {L2.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={AR} fill="white" />)}
            {/* L3 nodes */}
            {L3.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={LR} fill="white" />)}
            {/* Name label bars — root + L2 */}
            {[ROOT, ...L2].map(([x, y], i) => (
              <rect key={i} x={x - 32} y={y + AR + 6} width={64} height={8} rx={4} fill="white" />
            ))}
            {/* Name label bars — L3 */}
            {L3.map(([x, y], i) => (
              <rect key={i} x={x - 27} y={y + LR + 6} width={54} height={7} rx={3} fill="white" />
            ))}
          </mask>
        </defs>
        {/* Single gradient rect clipped to all skeleton shapes via mask */}
        <rect x="310" y="140" width="780" height="460" fill="url(#sk-grad)" mask="url(#sk-mask)" />
      </svg>
    </div>
  );
}

const HallOfFame = () => {
  const { sendRequest } = useHttpClient();

  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setError(null);
        const response = await sendRequest("user/tree-layout", "GET");
        setNodes(response.nodes);
        setLoading(false);
      } catch (err) {
        setError("Failed to load alumni data. Using sample data.");
      }
    };
    fetchNodes();
  }, []);

  const handleUserClick = (user) => {
    if (user.quote) {
      setSelectedUser(user);
      setVisible(true);
    }
  };

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Alumni Tree" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Start Breadcrump Area */}
      <div
        className="rn-page-title-area pt--120 pb--190 bg_image bg_image--15"
        style={{ backgroundImage: `url(/assets/images/bg/bg-image-29.webp)` }}
        data-black-overlay="6"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rn-page-title text-center pt--100">
                <h2 className="title theme-gradient">Alumni Tree</h2>
                <p>
                  Our esteemed alumni members who make our society exceptional
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Breadcrump Area */}

      {/* Start Alumni Tree Area */}
      <div className="rn-alumni-area mt--100 rn-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb--30">
                <p className="description">
                  Click on members to read their inspiring quotes or see details
                  for them.
                  <br />
                  Want to join them?{" "}
                  <AlumniRegistrationButton
                    className="link-hover-red"
                    linkStyle={{ display: "inline" }}
                  >
                    Do not waste a minute!
                  </AlumniRegistrationButton>
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <TreeSkeleton />
          ) : (
            <>
              {error && (
                <div
                  className="alert alert-warning mb--20"
                  style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeaa7",
                    borderRadius: "4px",
                    padding: "12px 16px",
                    color: "#856404",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}
              <div className="user-tree-section">
                <Tree nodes={nodes} onUserClick={handleUserClick} />
              </div>
            </>
          )}
        </div>
      </div>
      {/* End Alumni Tree Area */}

      <FooterTwo />

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: '26px' }} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default HallOfFame;
