import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiBriefcase, FiUsers, FiCalendar, FiSearch } from "react-icons/fi";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import { selectUser } from "../../redux/user";
import { INTERNSHIPS_LIST } from "../../util/defines/INTERNSHIPS";
import InternshipCard from "../../elements/ui/cards/InternshipCard";
import MembersOnlyApplyModal from "../../elements/ui/modals/MembersOnlyApplyModal";
import { Paginator } from "primereact/paginator";

const ROWS_PER_PAGE_OPTIONS = [6, 12, 24];
const DEFAULT_ROWS = 12;
const SEARCH_DEBOUNCE_MS = 500;

const TYPE_ALL = "all";
const TYPE_BULGARIAN = "bulgarian";
const TYPE_INTERNATIONAL = "international";

const Internships = () => {
  const { sendRequest } = useHttpClient();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMembersOnlyModal, setShowMembersOnlyModal] = useState(false);
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") || "");

  const rawType = searchParams.get("type");
  const typeParam =
    rawType === TYPE_BULGARIAN || rawType === TYPE_INTERNATIONAL
      ? rawType
      : TYPE_ALL;
  const rowsFromUrl = parseInt(searchParams.get("rows") || String(DEFAULT_ROWS), 10);
  const rowsParam = ROWS_PER_PAGE_OPTIONS.includes(rowsFromUrl) ? rowsFromUrl : DEFAULT_ROWS;
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    const currentUrlSearch = searchParams.get("search") || "";
    if (trimmed === currentUrlSearch) return;

    const timeoutId = window.setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) {
          next.set("search", trimmed);
        } else {
          next.delete("search");
        }
        next.delete("page");
        return next;
      }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, setSearchParams]);

  const updateUrl = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === TYPE_ALL || value === "1") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const filteredList = useMemo(() => {
    let list = INTERNSHIPS_LIST;
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const type = searchParams.get("type") || TYPE_ALL;

    if (type === TYPE_BULGARIAN) {
      list = list.filter((i) => i.label === "Bulgarian");
    } else if (type === TYPE_INTERNATIONAL) {
      list = list.filter((i) => i.label === "International & Remote");
    }

    if (search) {
      list = list.filter(
        (i) =>
          (i.company && i.company.toLowerCase().includes(search)) ||
          (i.specialty && i.specialty.toLowerCase().includes(search))
      );
    }
    return list;
  }, [searchParams]);

  const totalRecords = filteredList.length;
  const maxPage = Math.max(1, Math.ceil(totalRecords / rowsParam));
  const pageParam = Math.min(pageFromUrl, maxPage);
  const first = (pageParam - 1) * rowsParam;
  const paginatedList = useMemo(
    () => filteredList.slice(first, first + rowsParam),
    [filteredList, first, rowsParam]
  );

  const onPageChange = (event) => {
    updateUrl({ page: event.page + 1, rows: event.rows });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleTypeChange = (type) => {
    updateUrl({ type: type === TYPE_ALL ? undefined : type, page: 1 });
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (user?.token) {
          const responseData = await sendRequest(`user/current?withTickets=false&withChristmas=false`);
          setCurrentUser(responseData.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [user?.token]);

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Internships - BGSNL Community" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
        forceRegion={currentUser?.region ?? null}
      />

      {/* Start Page Title Area */}
      <div
        className="rn-page-title-area pt--120 pb--190 bg_image bg_image--15"
        data-black-overlay="6"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rn-page-title text-center pt--100">
                <h2 className="title theme-gradient">Internships</h2>
                <p>
                  Discover career opportunities and connect with our partner
                  companies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Page Title Area */}

      {/* Start Internships Area */}
      <div className="rn-internships-area mt--100 rn-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb--50">
                <h3 className="title">Available Positions</h3>
                <p className="description">
                  Explore internship opportunities from our partner companies.
                  These positions are carefully curated to provide valuable
                  experience and career development. Join our community to
                  access exclusive opportunities and connect with industry
                  professionals.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="row mb--50">
            <div className="col-lg-4 col-md-6 col-12">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiBriefcase />
                </div>
                <div className="stat-content">
                  <h4>{INTERNSHIPS_LIST.length}</h4>
                  <p>Available Positions</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-12">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiUsers />
                </div>
                <div className="stat-content">
                  <h4>50+</h4>
                  <p>Partner Companies</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-12">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiCalendar />
                </div>
                <div className="stat-content">
                  <h4>Weekly</h4>
                  <p>New Opportunities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and filters */}
          <div className="internships-filters mb--40 d-flex flex-wrap justify-content-between align-items-center">
            <form
              onSubmit={handleSearchSubmit}
              className="internships-search-form"
            >
              <div style={{ maxWidth: "400px" }}>
                <div style={{ position: "relative" }}>
                  <FiSearch
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6b7280",
                      fontSize: "18px",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="form-control"
                    style={{
                      paddingLeft: "44px",
                      borderRadius: "10px",
                      border: "1px solid rgba(0,0,0,0.1)",
                      fontSize: "15px",
                    }}
                    aria-label="Search internships"
                  />
                </div>
              </div>
            </form>

            <div className="internships-type-filter d-flex flex-wrap gap-2 align-items-center">
              {[
                { value: TYPE_ALL, label: "All" },
                { value: TYPE_BULGARIAN, label: "Bulgarian" },
                { value: TYPE_INTERNATIONAL, label: "International & Remote" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  className={
                    typeParam === value
                      ? "rn-button-style--2 rn-btn-solid-red"
                      : "rn-button-style--2"
                  }
                  style={{
                    padding: "8px 18px",
                    fontSize: "14px",
                    borderRadius: "8px",
                    border:
                      typeParam === value
                        ? "none"
                        : "1px solid rgba(0,0,0,0.15)",
                    backgroundColor:
                      typeParam === value ? undefined : "transparent",
                    color: typeParam === value ? "#fff" : "#374151",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* All Internships Grid with pagination */}
          {INTERNSHIPS_LIST.length > 0 ? (
            <>
              {paginatedList.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${first}-${typeParam}-${searchParams.get("search") || ""}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="internships-grid"
                      style={{ marginBottom: "24px" }}
                    >
                      {paginatedList.map((internship, index) => (
                        <motion.div
                          key={internship.id ?? index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            ease: "easeOut",
                          }}
                        >
                          <InternshipCard
                            internship={internship}
                            user={currentUser}
                            isPreview={false}
                            onApplyWhenGuest={() =>
                              setShowMembersOnlyModal(true)
                            }
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                  <motion.div
                    className="pagination-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                  >
                    <Paginator
                      first={first}
                      rows={rowsParam}
                      totalRecords={totalRecords}
                      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                      onPageChange={onPageChange}
                    />
                  </motion.div>
                </>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="empty-filters"
                    className="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="empty-icon">
                      <FiBriefcase />
                    </div>
                    <h3>No internships match your filters</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FiBriefcase />
              </div>
              <h3>No Internships Available</h3>
              <p>Check back soon for new opportunities.</p>
            </div>
          )}

          {/* Benefits Section */}
          {/* <div className="row mt--50">
            <div className="col-lg-12">
              <div className="benefits-section">
                <h4>Why Join BGSNL Community?</h4>
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <div className="benefit-icon">🎯</div>
                    <h5>Exclusive Opportunities</h5>
                    <p>
                      Access to internships and job opportunities not available
                      elsewhere
                    </p>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">🤝</div>
                    <h5>Professional Network</h5>
                    <p>
                      Connect with industry professionals and fellow students
                    </p>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">📈</div>
                    <h5>Career Development</h5>
                    <p>Get mentorship and guidance for your career growth</p>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">💼</div>
                    <h5>Partner Companies</h5>
                    <p>Direct access to our network of partner organizations</p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Call to Action */}
          <div className="row mt--50">
            <div className="col-lg-12">
              <div className="cta-section">
                <h4>Ready to Start Your Career Journey?</h4>
                <p>
                  Join our community to access exclusive internship
                  opportunities, connect with industry professionals, and take
                  the first step towards your dream career. New positions are
                  added regularly!
                </p>
                <div className="cta-actions">
                  {user.token ? (
                    <button
                      className="rn-button-style--2 rn-btn-green"
                      onClick={() => navigate("/user#internships")}
                    >
                      View All internships
                    </button>
                  ) : (
                    <>
                      <button
                        className="rn-button-style--2 rn-btn-green"
                        onClick={() => navigate("/join-the-society")}
                      >
                        Join Our Community
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Internships Area */}

      <MembersOnlyApplyModal
        visible={showMembersOnlyModal}
        onHide={() => setShowMembersOnlyModal(false)}
      />

      <FooterTwo forceRegion={currentUser?.region ?? null} />

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default Internships;
