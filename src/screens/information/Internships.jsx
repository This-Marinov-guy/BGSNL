"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiBriefcase,
  FiChevronUp,
  FiUsers,
} from "@/elements/ui/icons/IconlyIcons";
import {
  useNavigate,
} from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import FooterTwo from "../../component/footer/FooterTwo";
import HeaderTwo from "../../component/header/HeaderTwo";
import Breadcrumb from "../../elements/common/Breadcrumb";
import Pagination from "../../elements/common/Pagination";
import InternshipCard from "../../elements/ui/cards/InternshipCard";
import FilterPanel from "@/elements/ui/filters/FilterPanel";
import { useFilterSearchParams } from "@/hooks/common/use-filter-search-params";
import { SelectInput } from "@/compat/primereact";
import PageLoading from "../../elements/ui/loading/PageLoading";
import MembersOnlyApplyModal from "../../elements/ui/modals/MembersOnlyApplyModal";
import { useHttpClient } from "../../hooks/common/http-hook";
import { selectUser } from "../../redux/user";
import { ANALYTICS_EVENTS } from "../../util/analytics/events.mjs";
import { clarityEvent } from "../../util/functions/helpers";

const ROWS_PER_PAGE_OPTIONS = [6, 12, 24];
const DEFAULT_ROWS = 12;
const SEARCH_DEBOUNCE_MS = 350;

const TYPE_ALL = "all";
const TYPE_BULGARIAN = "bulgarian";
const TYPE_INTERNATIONAL = "international";

const Internships = ({ initialInternships = [] }) => {
  const { sendRequest } = useHttpClient();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [searchParams, setSearchParams] = useFilterSearchParams();

  // `initialInternships` comes from the server render, so the list is in the
  // HTML instead of behind a <Loader />. The effect below still refetches after
  // hydration (it also needs the current user to gate member-only listings).
  const [loading, setLoading] = useState(!initialInternships.length);
  const [internships, setInternships] = useState(initialInternships);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMembersOnlyModal, setShowMembersOnlyModal] = useState(false);
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") || "");

  useEffect(() => {
    clarityEvent(ANALYTICS_EVENTS.INTERNSHIPS_OPENED);
  }, []);

  const rawType = searchParams.get("type");
  const typeParam =
    rawType === TYPE_BULGARIAN || rawType === TYPE_INTERNATIONAL
      ? rawType
      : TYPE_ALL;
  const rowsFromUrl = parseInt(searchParams.get("rows") || String(DEFAULT_ROWS), 10);
  const rowsParam = ROWS_PER_PAGE_OPTIONS.includes(rowsFromUrl) ? rowsFromUrl : DEFAULT_ROWS;
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const searchParam = searchParams.get("search") || "";
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    const currentUrlSearch = searchParam;
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
  }, [searchInput, searchParam, setSearchParams]);

  const updateUrl = (updates) => {
    setSearchParams(next => {
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === TYPE_ALL || String(value) === "1") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      return next;
    }, { replace: true });
  };

  const filteredList = useMemo(() => {
    let list = internships;
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
  }, [internships, searchParams]);

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

  const handleTypeChange = (type) => {
    updateUrl({ type: type === TYPE_ALL ? undefined : type, page: 1 });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const internshipsData = await sendRequest("internship/list", "GET", null, {}, false, false);
        setInternships(internshipsData?.internships ?? []);

        if (user?.session) {
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

    fetchData();
  }, [user?.session]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <React.Fragment>
      <PageHelmet
        pageTitle="Internships - BGSNL Community"
        image="/assets/images/news/internships.jpg"
        canonicalUrl="https://www.bulgariansociety.nl/internships"
      />

      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
        forceRegion={currentUser?.region ?? null}
      />

      <Breadcrumb
        title="Internships"
        description="Discover career opportunities and connect with our partner companies."
      />

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
          <div className="row mb--50 align-items-stretch">
            <div className="col-lg-6 col-md-6 col-12 d-flex flex-column" style={{ gap: "20px" }}>
              <div className="stat-card" style={{ flex: 1, margin: 0 }}>
                <div className="stat-icon">
                  <FiBriefcase />
                </div>
                <div className="stat-content">
                  <h4>{internships.length}</h4>
                  <p>Available Positions</p>
                </div>
              </div>

              <div className="stat-card" style={{ flex: 1, margin: 0 }}>
                <div className="stat-icon">
                  <FiUsers />
                </div>
                <div className="stat-content">
                  <h4>50+</h4>
                  <p>Partner Companies</p>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-6 col-12 mt-4 mt-md-0">
              <div style={{ position: "relative", height: "100%", borderRadius: "12px", overflow: "hidden", minHeight: "200px" }}>
                <img
                  src="/assets/images/events/pwc.jpeg"
                  alt="career"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            </div>
          </div>

          {/* Search and filters */}
          <FilterPanel onClear={() => {
            setSearchInput("");
            updateUrl({ search: undefined, type: undefined, page: undefined });
          }}>
            <label><span>Search internships</span><input className="bgsnl-form-control" type="search" value={searchInput} onChange={event => setSearchInput(event.target.value)} /></label>
            <label><span>Type</span><SelectInput className="bgsnl-form-control" value={typeParam} onChange={event => handleTypeChange(event.target.value)}>
              <option value={TYPE_ALL}>All</option>
              <option value={TYPE_BULGARIAN}>Bulgarian</option>
              <option value={TYPE_INTERNATIONAL}>International &amp; Remote</option>
            </SelectInput></label>
          </FilterPanel>

          {/* All Internships Grid with pagination */}
          {internships.length > 0 ? (
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
                          style={{ height: "100%" }}
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
                    <Pagination
                      first={first}
                      rows={rowsParam}
                      totalRecords={totalRecords}
                      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                      onPageChange={onPageChange}
                      ariaLabel="Internships pagination"
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
                  {user.session ? (
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
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

Internships.propTypes = {
  initialInternships: PropTypes.arrayOf(PropTypes.object),
};

export default Internships;
