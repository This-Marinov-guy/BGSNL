import { SelectInput } from "@/compat/primereact";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "@/util/navigation";
import { useFilterSearchParams } from "@/hooks/common/use-filter-search-params";
import { useLoadEvents } from "../../../../hooks/common/api-hooks";
import { useHttpClient } from "@/hooks/common/http-hook";
import { selectEventDrafts, selectEventsDashboard } from "../../../../redux/events";
import { selectUser } from "../../../../redux/user";
import { ALL_EVENT_REGIONS_ACCESS, ACCESS_4 } from "../../../../util/defines/common";
import { ADMIN_EVENT_REGIONS, REGIONS } from "../../../../util/defines/REGIONS_DESIGN";
import { sessionClaims } from "../../../../util/functions/authorization";
import { capitalizeFirstLetter } from "../../../../util/functions/capitalize";
import { hasOverlap } from "../../../../util/functions/helpers";
import StepContentTransition from "../../../ui/functional/StepContentTransition";
import EventsLoading from "../../../ui/loading/EventsLoading";
import Pagination from "../../../common/Pagination";
import Filter from "../Filter";
import Event from "./Event";
import EventModal from "./EventModal";
import { eventDateTime, isActiveEvent } from "@/util/functions/event-archive.mjs";
import { clearEventModalQuery, EVENT_PAGE_SIZES, readEventDashboardQuery } from "@/util/event-dashboard-query.mjs";

const ARCHIVE_BATCH_SIZE = 8;
const eventKey = event => String(event?.id || event?._id || "");

const archiveMonthLabel = (event) => {
    const timestamp = eventDateTime(event);
    return timestamp === null
        ? "Date not set"
        : new globalThis.Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(timestamp);
};

const EventList = () => {
    const { reloadEvents, eventsLoading } = useLoadEvents();
    const [pastEvents, setPastEvents] = useState([]);
    const [pastTotal, setPastTotal] = useState(0);
    const [pastLoading, setPastLoading] = useState(false);
    const viewSelectId = useId();
    const { sendRequest } = useHttpClient();
    const sendRequestRef = useRef(sendRequest);
    const eventModalHistoryRef = useRef(false);
    sendRequestRef.current = sendRequest;

    const user = useSelector(selectUser);
    const { roles = [], region = "" } = sessionClaims(user.session) ?? {};
    const isAuthorized = hasOverlap(roles, ALL_EVENT_REGIONS_ACCESS);
    const canAddEvents = hasOverlap(roles, ACCESS_4);
    const dashboardRegions = isAuthorized ? ADMIN_EVENT_REGIONS : REGIONS;

    const [searchParams, setSearchParams] = useFilterSearchParams();
    const {
        eventPage,
        eventPageSize,
        eventView,
        fullscreen: modalFullscreen,
        guestListExtended,
        guestSearch,
        modalView,
        openEventId,
    } = readEventDashboardQuery(searchParams);
    const regionParam = isAuthorized && dashboardRegions.includes(searchParams.get("region")) ? searchParams.get("region") : '';
    const regionList = isAuthorized ?
        // show by filter
        (regionParam ? dashboardRegions.filter((r) => r === regionParam) : dashboardRegions) :
        //only show region events
        REGIONS.filter((r) => r === region);

    const events = useSelector(selectEventsDashboard);
    const drafts = useSelector(selectEventDrafts);
    const visibleDrafts = drafts.filter(event => isAuthorized
        ? !regionParam || event.region === regionParam
        : regionList.includes(event.region));

    const visibleEvents = regionList.flatMap((eventRegion) => events[eventRegion] ?? []);
    const activeEvents = visibleEvents.filter(event => isActiveEvent(event));
    const showDrafts = eventView === "drafts";
    const showPastOrArchived = eventView === "past";
    const currentEvents = showDrafts ? visibleDrafts : showPastOrArchived ? pastEvents : activeEvents;
    const displayedSections = showDrafts
        ? [...new Set([...regionList, ...visibleDrafts.map(event => event.region || "")])].map((regionName) => ({
            key: regionName,
            label: regionName ? capitalizeFirstLetter(regionName, true) : "Unassigned region",
            events: visibleDrafts.filter(event => (event.region || "") === regionName),
            draft: true,
        }))
        : showPastOrArchived
            ? [...pastEvents.reduce((sections, event) => {
                const label = archiveMonthLabel(event);
                const section = sections.get(label) || { key: label, label, events: [] };
                section.events.push(event);
                sections.set(label, section);
                return sections;
            }, new Map()).values()]
            : regionList.map((regionName) => ({
                key: regionName,
                label: capitalizeFirstLetter(regionName, true),
                events: activeEvents.filter(event => event.region === regionName),
            }));
    const visibleCount = currentEvents.length;
    const loadedEvents = useMemo(
        () => [...Object.values(events).flat(), ...drafts, ...pastEvents],
        [events, drafts, pastEvents]
    );
    const selectedEvent = openEventId
        ? loadedEvents.find(event => eventKey(event) === openEventId)
        : null;

    const updateModalQuery = (update, options = { replace: true }) => {
        setSearchParams(current => {
            const next = new URLSearchParams(current);
            update(next);
            return next;
        }, options);
    };

    const setEventView = (nextView) => {
        updateModalQuery(params => {
            if (nextView === "active") params.delete("eventView");
            else params.set("eventView", nextView);
            params.delete("page");
            clearEventModalQuery(params);
        });
    };

    const setEventPage = ({ page, rows }) => {
        updateModalQuery(params => {
            const nextPage = page + 1;
            if (nextPage === 1) params.delete("page");
            else params.set("page", String(nextPage));
            if (rows === ARCHIVE_BATCH_SIZE) params.delete("pageSize");
            else params.set("pageSize", String(rows));
        }, { replace: false });
    };

    const openEventModal = (event) => {
        const id = eventKey(event);
        if (!id) return;
        eventModalHistoryRef.current = true;
        updateModalQuery(params => {
            clearEventModalQuery(params);
            params.set("event", id);
            params.set("modal", "event");
            if (eventView === "active") params.delete("eventView");
            else params.set("eventView", eventView);
        }, { replace: false });
    };

    const closeEventModal = () => {
        if (eventModalHistoryRef.current && typeof window !== "undefined") {
            eventModalHistoryRef.current = false;
            window.history.back();
            return;
        }
        updateModalQuery(clearEventModalQuery);
    };

    const setModalView = (nextModal) => {
        updateModalQuery(params => {
            params.set("modal", nextModal === "guest-list" ? "guest-list" : "event");
            params.delete("fullscreen");
            params.delete("extended");
            params.delete("guestSearch");
        });
    };

    const setModalFullscreen = (maximized) => {
        updateModalQuery(params => {
            if (maximized) params.set("fullscreen", "1");
            else params.delete("fullscreen");
        });
    };

    const setGuestListExtended = (extended) => {
        updateModalQuery(params => {
            if (extended) {
                params.set("extended", "1");
                params.set("fullscreen", "1");
            } else {
                params.delete("extended");
            }
        });
    };

    const setGuestSearch = (value) => {
        updateModalQuery(params => {
            if (value) params.set("guestSearch", value);
            else params.delete("guestSearch");
        });
    };

    const sessionId = user.session?.sid;
    const roleScope = [...roles].sort().join(",");
    useEffect(() => {
        if (sessionId) reloadEvents(true);
        // Activity renews the session object regularly. Only a change in the
        // login or permission scope should reload and unmount open previews.
    }, [sessionId, region, roleScope]);

    useEffect(() => {
        if (!showPastOrArchived) return undefined;
        let active = true;
        const controller = new AbortController();
        const params = new URLSearchParams({
            view: "past",
            page: String(eventPage),
            pageSize: String(eventPageSize),
        });
        if (regionParam) params.set("region", regionParam);
        setPastEvents([]);
        setPastTotal(0);
        setPastLoading(true);
        sendRequestRef.current(`future-event/full-data-events-list?${params}`, "GET", null, {}, false, false, { signal: controller.signal })
            .then((response) => {
                if (!active) return;
                const pageEvents = response?.events || [];
                const responseTotal = Number(response?.total);
                const total = Number.isFinite(responseTotal) && responseTotal >= 0
                    ? responseTotal
                    : ((eventPage - 1) * eventPageSize) + pageEvents.length + (response?.hasMore === true ? 1 : 0);
                const lastPage = Math.max(1, Math.ceil(total / eventPageSize));
                if (eventPage > lastPage) {
                    setSearchParams(current => {
                        if (lastPage === 1) current.delete("page");
                        else current.set("page", String(lastPage));
                        return current;
                    });
                    return;
                }
                setPastEvents(pageEvents);
                setPastTotal(total);
            })
            .finally(() => active && setPastLoading(false));
        return () => { active = false; controller.abort(); };
    }, [showPastOrArchived, eventPage, eventPageSize, regionParam, sessionId, roleScope]);

    return (
        <>
        {selectedEvent && (
            <EventModal
                event={selectedEvent}
                extended={guestListExtended}
                fullscreen={modalFullscreen}
                guestSearch={guestSearch}
                loadData={() => reloadEvents(true)}
                modalView={modalView}
                onExtendedChange={setGuestListExtended}
                onFullscreenChange={setModalFullscreen}
                onGuestSearchChange={setGuestSearch}
                onModalViewChange={setModalView}
                setShow={visible => { if (!visible) closeEventModal(); }}
                show
            />
        )}
        <header className="event-workspace-heading event-dashboard-heading">
            <div>
                <h1>Events dashboard</h1>
                <p>Review drafts, schedules and ticket status without leaving the overview.</p>
            </div>
            <div className="workspace-heading-actions">
                {canAddEvents && (
                    <Link
                        to="/user/dashboard/events/create"
                        className="rn-button-style--2 rn-btn-reverse-green"
                    >
                        <span>Create event</span>
                    </Link>
                )}
            </div>
        </header>
        {/* {isAuthorized && <div className="event-dashboard-stats" aria-label="Event totals">
            <div><span>Visible events</span><strong>{visibleEvents.length}</strong></div>
            <div><span>Upcoming</span><strong>{upcomingCount}</strong></div>
            <div><span>Drafts</span><strong>{visibleDrafts.length}</strong></div>
            <div><span>Sales closed</span><strong>{closedCount}</strong></div>
        </div>} */}
            <Filter regions={dashboardRegions} showRegion={isAuthorized} onClear={(params) => {
                params.delete("eventView");
                params.delete("pageSize");
                clearEventModalQuery(params);
            }}>
                <label htmlFor={viewSelectId}>
                    <span>Show</span>
                    <SelectInput id={viewSelectId} value={eventView} onChange={event => setEventView(event.target.value)}>
                        <option value="active">Active events</option>
                        <option value="past">Past &amp; archived</option>
                        <option value="drafts">Drafts</option>
                    </SelectInput>
                </label>
            </Filter>
            <StepContentTransition step={eventView === "active" ? 0 : eventView === "past" ? 1 : 2} direction={eventView === "active" ? "backward" : "forward"}>
            {(showPastOrArchived ? pastLoading && pastEvents.length === 0 : eventsLoading) ? <EventsLoading /> : <div className="event-dashboard-content">
                {!visibleCount && <p className="no-events-message">No {showDrafts ? "drafts" : showPastOrArchived ? "past or archived events" : "active events"} for the selected region.</p>}
                {displayedSections.map((section) => {
                    if (!section.events.length) return null;

                    return <section className={`region-section${section.draft ? " region-section--drafts" : ""}`} key={section.key}>
                        <header className="region-section__header">
                            <h2>{section.label}</h2>
                            <span>{section.events.length}</span>
                        </header>
                        <div className="events-grid">
                            {section.events.map(event => (
                                <Event key={event.id || event._id} event={event} onOpen={() => openEventModal(event)} />
                            ))}
                        </div>
                    </section>;
                })}
                {showPastOrArchived && !pastLoading && (pastTotal > EVENT_PAGE_SIZES[0] || eventPage > 1) && (
                    <Pagination
                        ariaLabel="Past events pages"
                        className="event-dashboard-pagination"
                        first={(eventPage - 1) * eventPageSize}
                        rows={eventPageSize}
                        rowsPerPageOptions={EVENT_PAGE_SIZES}
                        totalRecords={pastTotal}
                        onPageChange={setEventPage}
                    />
                )}
            </div>}
            </StepContentTransition>
        </>
    )
}

export default EventList
