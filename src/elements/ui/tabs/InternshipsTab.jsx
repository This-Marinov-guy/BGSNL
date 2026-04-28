import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Paginator } from "primereact/paginator";
import { TabView, TabPanel } from "primereact/tabview";
import InternshipCard from "../cards/InternshipCard";
import { useHttpClient } from "../../../hooks/common/http-hook";

const InternshipsTab = ({
  currentUser,
  onUserRefresh,
  INIT_ITEMS_PER_PAGE,
}) => {
  const { sendRequest } = useHttpClient();
  const [activeIndex, setActiveIndex] = useState(0);
  const [internships, setInternships] = useState([]);

  // Separate pagination state for each tab
  const [bulgarianFirst, setBulgarianFirst] = useState(0);
  const [bulgarianRows, setBulgarianRows] = useState(INIT_ITEMS_PER_PAGE);

  const [internationalFirst, setInternationalFirst] = useState(0);
  const [internationalRows, setInternationalRows] = useState(INIT_ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchInternships = async () => {
      const data = await sendRequest("internship/list", "GET", null, {}, false, false);
      const list = data?.internships;
      if (list?.length) setInternships(list);
    };
    fetchInternships();
  }, []);

  const bulgarianList = internships.filter((i) => i.label === "Bulgarian");
  const internationalList = internships.filter(
    (i) => i.label === "International & Remote"
  );

  const renderList = (list, first, rows, onPageChange) => {
    return (
      <>
        <div className="internships-grid">
          {list.slice(first, first + rows).map((i, index) => (
            <InternshipCard
              key={i._id ?? index}
              internship={i}
              user={currentUser}
              onUserRefresh={onUserRefresh}
            />
          ))}
        </div>

        <div className="pagination-container">
          <Paginator
            first={first}
            rows={rows}
            totalRecords={list.length ?? 0}
            rowsPerPageOptions={[INIT_ITEMS_PER_PAGE, 10, 15]}
            onPageChange={onPageChange}
          />
        </div>
      </>
    );
  };

  const handleBulgarianPageChange = (event) => {
    setBulgarianFirst(event.first);
    setBulgarianRows(event.rows);
  };

  const handleInternationalPageChange = (event) => {
    setInternationalFirst(event.first);
    setInternationalRows(event.rows);
  };

  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <h2>Available Internships</h2>
        <p>
          Exclusive internship opportunities for BGSNL members. New positions
          are added regularly.
        </p>
      </div>
      <div>
        <TabView
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
        >
          <TabPanel header={`All (${internships.length})`}>
            {renderList(internships, 0, internships.length, () => {})}
          </TabPanel>
          <TabPanel header={`Bulgarian (${bulgarianList.length})`}>
            {bulgarianList.length > 0 ? (
              renderList(
                bulgarianList,
                bulgarianFirst,
                bulgarianRows,
                handleBulgarianPageChange
              )
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{"💼"}</div>
                <h3>No Bulgarian Internships</h3>
                <p>Check back soon for new opportunities.</p>
              </div>
            )}
          </TabPanel>
          <TabPanel
            header={`International & Remote (${internationalList.length})`}
          >
            {internationalList.length > 0 ? (
              renderList(
                internationalList,
                internationalFirst,
                internationalRows,
                handleInternationalPageChange
              )
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{"💼"}</div>
                <h3>No International/Remote Internships</h3>
                <p>Check back soon for new opportunities.</p>
              </div>
            )}
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

InternshipsTab.propTypes = {
  currentUser: PropTypes.object.isRequired,
  onUserRefresh: PropTypes.func,
  INIT_ITEMS_PER_PAGE: PropTypes.number.isRequired,
};

export default InternshipsTab;
