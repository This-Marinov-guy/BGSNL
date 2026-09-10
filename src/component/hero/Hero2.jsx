import { useSelector } from "react-redux";
import {
  Link,
  useParams,
} from "@/util/navigation";
import { selectUser } from "../../redux/user";

const Hero2 = () => {
  const user = useSelector(selectUser);
  const { region } = useParams();

  return (
    <div className="mt--140">
      {/* <div className="hero-line mb--20" alt="line" /> */}
      <div className="hero slider-activation slider-creative-agency">
        <div className="left-container">
          <h1 className="title archive theme-gradient type-display">
            {`Bulgarian Society ${region || "Netherlands"}`}
          </h1>
          <Link
            className={"rn-button-style--2 rn-btn-reverse-green"}
            to={user.session ? `/user` : "/signup"}
          >
            {user.session ? "Go To Profile" : "Become a Member"}
          </Link>{" "}
        </div>

        <img
          src={`/assets/images/bg/paralax/${region || "netherlands"}.webp`}
          className="right-container"
        />
      </div>
      {/* <div className="hero-line mt--20" alt="line" /> */}
    </div>
  );
};

export default Hero2;
