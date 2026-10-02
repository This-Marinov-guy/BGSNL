import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { TabView, TabPanel } from "@/compat/primereact";
import { FaBriefcase } from "@/elements/ui/icons/IconlyIcons";
import Pagination from "../../common/Pagination";
import InternshipCard from "../cards/InternshipCard";
import SearchField from "../functional/SearchField";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { LoadingSkeleton, LoadErrorBanner } from "../loading/LoadState";
import UserTabHeader from "./UserTabHeader";

const InternshipsTab = ({
  currentUser,
  onUserRefresh,
  INIT_ITEMS_PER_PAGE,
}) => {
  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const [activeIndex, setActiveIndex] = useState(0);
  const [internships, setInternships] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [search, setSearch] = useState("");

  // Separate pagination state for each tab
  const [bulgarianFirst, setBulgarianFirst] = useState(0);
  const [bulgarianRows, setBulgarianRows] = useState(INIT_ITEMS_PER_PAGE);

  const [internationalFirst, setInternationalFirst] = useState(0);
  const [internationalRows, setInternationalRows] = useState(INIT_ITEMS_PER_PAGE);

  useEffect(() => {
    let mounted = true;
    setLoadState("loading");
    request.current("internship/list", "GET", null, {}, false, false).then((data) => {
      if (!mounted) return;
      if (Array.isArray(data?.internships)) {
        setInternships(data.internships);
        setLoadState("loaded");
      } else {
        setLoadState("failed");
      }
    }).catch(() => {
      if (mounted) setLoadState("failed");
    });
    return () => { mounted = false; };
  }, [loadAttempt]);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredInternships = normalizedSearch
    ? internships.filter((internship) => [
      internship.company,
      internship.specialty,
      internship.location,
      internship.label,
      internship.duration,
      internship.languages,
      internship.description,
      internship.bonuses,
      internship.requirements,
    ].some((value) => String(value || "").toLocaleLowerCase().includes(normalizedSearch)))
    : internships;
  const bulgarianList = filteredInternships.filter((i) => i.label === "Bulgarian");
  const internationalList = filteredInternships.filter(
    (i) => i.label === "International & Remote"
  );

  const emptyState = (category) => (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        <FaBriefcase size={44} />
      </div>
      <h3>{normalizedSearch ? "No matching internships" : `No ${category} internships`}</h3>
      <p>{normalizedSearch ? "Try another company, position, location or keyword." : "Check back soon for new opportunities."}</p>
    </div>
  );

  const renderContent = (list, category, first, rows, onPageChange) => {
    if (loadState === "loading") {
      return <LoadingSkeleton label="Loading internships" variant="cards" count={4} />;
    }
    if (loadState === "failed") {
      return <LoadErrorBanner message="Internships could not be loaded." onRetry={() => setLoadAttempt((value) => value + 1)} />;
    }
    return list.length > 0 ? renderList(list, first, rows, onPageChange) : emptyState(category);
  };

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
          <Pagination
            first={first}
            rows={rows}
            totalRecords={list.length ?? 0}
            rowsPerPageOptions={[INIT_ITEMS_PER_PAGE, 10, 15]}
            onPageChange={onPageChange}
            ariaLabel="Member internships pagination"
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

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setBulgarianFirst(0);
    setInternationalFirst(0);
  };

  return (
    <div className="tab-content-wrapper">
      <UserTabHeader title="Internships" />
      <div>
        <TabView
          activeIndex={activeIndex}
          className="internships-tab-view"
          navigationContent={(
            <SearchField
              ariaLabel="Search internships"
              className="internships-tab-search"
              name="internship-search"
              placeholder="Search internships"
              value={search}
              onChange={handleSearchChange}
            />
          )}
          onTabChange={(e) => setActiveIndex(e.index)}
        >
          <TabPanel header={loadState === "loaded" ? `All (${filteredInternships.length})` : "All"}>
            {renderContent(filteredInternships, "available", 0, filteredInternships.length, () => {})}
          </TabPanel>
          <TabPanel header={loadState === "loaded" ? `Bulgarian (${bulgarianList.length})` : "Bulgarian"}>
            {renderContent(bulgarianList, "Bulgarian", bulgarianFirst, bulgarianRows, handleBulgarianPageChange)}
          </TabPanel>
          <TabPanel
            header={loadState === "loaded" ? `International & Remote (${internationalList.length})` : "International & Remote"}
          >
            {renderContent(internationalList, "international or remote", internationalFirst, internationalRows, handleInternationalPageChange)}
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
