import { FiChevronLeft } from "@/elements/ui/icons/IconlyIcons";
import { useNavigate } from "@/util/navigation";

const WithBackBtn = (props) => {
    const navigate = useNavigate();

    return (
        <div className="mt--40" >
            <p onClick={() => navigate(-1)} className='information mr--20' style={{ cursor: 'pointer', display: 'inline' }}>
                <FiChevronLeft />
                Back |
            </p>
            {props.children}
        </div>

    )
}

export default WithBackBtn