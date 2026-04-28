import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import HeaderTwo from "../../component/header/HeaderTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiArrowLeft } from "react-icons/fi";
import InternshipForm from "../../elements/actions/form/InternshipForm";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";

const EditInternship = () => {
  const { internshipId } = useParams();
  const { sendRequest } = useHttpClient();
  const [internship, setInternship] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await sendRequest("internship/admin-list");
        const found = (data?.internships ?? []).find((i) => i._id === internshipId);
        if (found) {
          setInternship(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    };
    load();
  }, [internshipId]);

  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <div className="container mt--200 mb--60">
        <div className="mb--30">
          <Link
            to="/user/internships-dashboard"
            className="d-inline-flex align-items-center"
            style={{ color: "#6b7280", textDecoration: "none", gap: "6px", fontSize: "15px" }}
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
        <h3 className="mb--40">Edit Internship</h3>
        {notFound && <p>Internship not found.</p>}
        {!notFound && !internship && <Loader />}
        {internship && <InternshipForm internship={internship} />}
      </div>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default EditInternship;
