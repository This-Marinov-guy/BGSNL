import { useEffect, useId, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "@/util/navigation";
import { useLoadEvents } from "../../../../hooks/common/api-hooks";
import { selectEventDrafts, selectEventsDashboard } from "../../../../redux/events";
import { selectUser } from "../../../../redux/user";
import { ACCESS_2, ACCESS_4 } from "../../../../util/defines/common";
import { ADMIN_EVENT_REGIONS, REGIONS } from "../../../../util/defines/REGIONS_DESIGN";
import { sessionClaims } from "../../../../util/functions/authorization";
import { capitalizeFirstLetter } from "../../../../util/functions/capitalize";
import { hasOverlap } from "../../../../util/functions/helpers";
import { FiArrowLeft } from "../../../ui/icons/IconlyIcons";
import StepContentTransition from "../../../ui/functional/StepContentTransition";
import EventsLoading from "../../../ui/loading/EventsLoading";
import Filter from "../Filter";
import Event from "./Event";

const EventList = () => {
    const { reloadEvents, eventsLoading } = useLoadEvents();
    const [showDrafts, setShowDrafts] = useState(false);
    const draftToggleId = useId();

    const user = useSelector(selectUser);
    const { roles = [], region = "" } = sessionClaims(user.session) ?? {};
    const isAuthorized = hasOverlap(roles, ACCESS_2);
    const canAddEvents = hasOverlap(roles, ACCESS_4);
    const dashboardRegions = isAuthorized ? ADMIN_EVENT_REGIONS : REGIONS;

    const [searchParams] = useSearchParams();
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
    const now = Date.now();
    const upcomingCount = visibleEvents.filter(
        (event) => !event.date || new Date(event.date).valueOf() >= now
    ).length;
    const closedCount = visibleEvents.filter(
        (event) => event.isSaleClosed || (event.ticketTimer && new Date(event.ticketTimer).valueOf() < now)
    ).length;

    const sessionId = user.session?.sid;
    const roleScope = [...roles].sort().join(",");
    useEffect(() => {
        if (sessionId) reloadEvents(true);
        // Activity renews the session object regularly. Only a change in the
        // login or permission scope should reload and unmount open previews.
    }, [sessionId, region, roleScope]);

    return (
        <>
        <header className="event-workspace-heading event-dashboard-heading">
            <div>
                <h1>Events dashboard</h1>
                <p>Review drafts, schedules and ticket status without leaving the overview.</p>
            </div>
            <div className="workspace-heading-actions">
                <Link
                    className="workspace-account-link"
                    to="/user#profile"
                >
                    <FiArrowLeft aria-hidden="true" />
                    <span>Back to account</span>
                </Link>
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
        {isAuthorized && <div className="event-dashboard-stats" aria-label="Event totals">
            <div><span>Visible events</span><strong>{visibleEvents.length}</strong></div>
            <div><span>Upcoming</span><strong>{upcomingCount}</strong></div>
            <div><span>Drafts</span><strong>{visibleDrafts.length}</strong></div>
            <div><span>Sales closed</span><strong>{closedCount}</strong></div>
        </div>}
            {isAuthorized && <Filter regions={dashboardRegions} />}
            <div className="event-dashboard-view-toggle">
                <label htmlFor={draftToggleId}>Drafts</label>
                <button id={draftToggleId} type="button" role="switch" aria-checked={showDrafts} aria-label="Show drafts" className="event-ticket-switch" onClick={() => setShowDrafts(current => !current)}><span /></button>
            </div>
            <StepContentTransition step={showDrafts ? 1 : 0} direction={showDrafts ? "forward" : "backward"}>
            {eventsLoading ? <EventsLoading /> : <div className="event-dashboard-content">
                {showDrafts && (
                    <section className="region-section region-section--drafts">
                        <header className="region-section__header">
                            <h2>Drafts</h2>
                            <span>{visibleDrafts.length}</span>
                        </header>
                        <div className="events-grid">
                            {visibleDrafts.length ? visibleDrafts.map((event) => (
                                <Event
                                    key={event.id}
                                    event={event}
                                    loadData={() => reloadEvents(true)}
                                />
                            )) : <p className="no-events-message">No drafts for the selected region.</p>}
                        </div>
                    </section>
                )}
                {!showDrafts && !visibleEvents.length && <p className="no-events-message">No events for the selected region.</p>}
                {!showDrafts && regionList.map((region) => {
                    const regionEvents = events[region] ?? [];
                    if (!regionEvents.length) return null;

                    return <section className="region-section" key={region}>
                        <header className="region-section__header">
                            <h2>{capitalizeFirstLetter(region, true)}</h2>
                            <span>{regionEvents.length}</span>
                        </header>
                        <div className="events-grid">
                            {regionEvents.length ? regionEvents.map((event) => (
                                <Event key={event.id} event={event} loadData={() => reloadEvents(true)} />
                            )) : <p className="no-events-message">No current events for this region.</p>}
                        </div>
                    </section>;

                })}
            </div>}
            </StepContentTransition>
        </>
    )
}

export default EventList
