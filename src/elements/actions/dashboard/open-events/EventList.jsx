import { SelectInput } from "@/compat/primereact";
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
import StepContentTransition from "../../../ui/functional/StepContentTransition";
import EventsLoading from "../../../ui/loading/EventsLoading";
import Filter from "../Filter";
import Event from "./Event";

const EventList = () => {
    const { reloadEvents, eventsLoading } = useLoadEvents();
    const [showDrafts, setShowDrafts] = useState(false);
    const viewSelectId = useId();

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
    const displayedRegions = showDrafts
        ? [...new Set([...regionList, ...visibleDrafts.map(event => event.region || "")])]
        : regionList;
    const visibleCount = showDrafts ? visibleDrafts.length : visibleEvents.length;
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
            <Filter regions={dashboardRegions} showRegion={isAuthorized} onClear={() => setShowDrafts(false)}>
                <label htmlFor={viewSelectId}>
                    <span>Show</span>
                    <SelectInput id={viewSelectId} value={showDrafts ? "drafts" : "events"} onChange={event => setShowDrafts(event.target.value === "drafts")}>
                        <option value="events">Events</option>
                        <option value="drafts">Drafts</option>
                    </SelectInput>
                </label>
            </Filter>
            <StepContentTransition step={showDrafts ? 1 : 0} direction={showDrafts ? "forward" : "backward"}>
            {eventsLoading ? <EventsLoading /> : <div className="event-dashboard-content">
                {!visibleCount && <p className="no-events-message">No {showDrafts ? "drafts" : "events"} for the selected region.</p>}
                {displayedRegions.map(eventRegion => {
                    const regionEvents = showDrafts
                        ? visibleDrafts.filter(event => (event.region || "") === eventRegion)
                        : events[eventRegion] ?? [];
                    if (!regionEvents.length) return null;

                    return <section className={`region-section${showDrafts ? " region-section--drafts" : ""}`} key={eventRegion}>
                        <header className="region-section__header">
                            <h2>{eventRegion ? capitalizeFirstLetter(eventRegion, true) : "Unassigned region"}</h2>
                            <span>{regionEvents.length}</span>
                        </header>
                        <div className="events-grid">
                            {regionEvents.map(event => (
                                <Event key={event.id} event={event} loadData={() => reloadEvents(true)} />
                            ))}
                        </div>
                    </section>;
                })}
            </div>}
            </StepContentTransition>
        </>
    )
}

export default EventList
