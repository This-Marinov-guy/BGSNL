import React from "react";
import PropTypes from "prop-types";
import { Paginator } from "primereact/paginator";
import { INTERNSHIPS_LIST } from "../../../util/defines/INTERNSHIPS";
import InternshipCard from "../cards/InternshipCard";

const InternshipsTab = ({ currentUser, first, rows, onPageChange, INIT_ITEMS_PER_PAGE }) => {
  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <h2>Available Internships</h2>
        <p>
          Exclusive internship opportunities for BGSNL members. New positions are added regularly.
        </p>
      </div>
      <div className="tab-body">
        {INTERNSHIPS_LIST.length > 0 ? (
          <>
            <div className="internships-grid">
              {INTERNSHIPS_LIST.slice(first, first + rows).map((i, index) => (
                <InternshipCard key={index} internship={i} user={currentUser}/>
              ))}
            </div>
            
            <div className="pagination-container">
              <Paginator
                first={first}
                rows={rows}
                totalRecords={INTERNSHIPS_LIST.length ?? 0}
                rowsPerPageOptions={[INIT_ITEMS_PER_PAGE, 10, 15]}
                onPageChange={onPageChange}
              />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">{"💼"}</div>
            <h3>No Internships Available</h3>
            <p>Check back soon for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
};

InternshipsTab.propTypes = {
  currentUser: PropTypes.object.isRequired,
  first: PropTypes.number.isRequired,
  rows: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  INIT_ITEMS_PER_PAGE: PropTypes.number.isRequired,
};

export default InternshipsTab;
