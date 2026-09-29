import { LoadingSkeleton } from "./LoadState";

const EventsLoading = () => {
    return (
        <LoadingSkeleton label="Loading events" variant="cards" count={4} />
    )
}

export default EventsLoading
