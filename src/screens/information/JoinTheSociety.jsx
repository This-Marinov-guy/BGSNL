"use client";

import ScrollToTop from "@/component/common/ScrollToTop";
import { FaGraduationCap, FiArrowRight, FiChevronUp, FiUsers } from "@/elements/ui/icons/IconlyIcons";
import { Link } from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import FooterTwo from "../../component/footer/FooterTwo";
import HeaderTwo from "../../component/header/HeaderTwo";
import styles from "./joinSociety.module.scss";

const memberships = [
  {
    type: "member",
    title: "Member",
    audience: "For students",
    description: "Make the most of your student years with the Bulgarian community.",
    image: "/assets/images/alumni/members.jpg",
    imageAlt: "Society member wearing a bear mask and serving banitsa",
    benefits: ["Discounts on society events", "Internship opportunities", "Join a committee or board"],
    href: "/signup",
    action: "Join as Member",
  },
  {
    type: "alumni",
    title: "Alumni",
    audience: "For graduates",
    description: "Stay connected after graduation as you begin your working life.",
    image: "/assets/images/alumni/alumni.jpeg",
    imageAlt: "Graduate in a graduation gown holding a diploma",
    benefits: ["Network with fellow alumni", "Take part in alumni events", "Support the society and its mission"],
    href: "/alumni/register",
    action: "Join as Alumni",
  },
];

export default function JoinTheSociety() {
  return (
    <>
      <PageHelmet pageTitle="Join the society" />
      <HeaderTwo headertransparent="header--transparent" colorblack="color--black" logoname="logo.png" />

      <main className="rn-service-area pt--160 pb--80 bg_color--1">
        <div className="container">
          <header className={styles.heading}>
            <h1>Choose your path in the society</h1>
          </header>

          <div className={styles.grid}>
            {memberships.map(membership => (
              <article className={styles.card} data-membership={membership.type} aria-labelledby={`join-${membership.type}`} key={membership.type}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <h2 id={`join-${membership.type}`}>
                      {membership.type === "alumni" ? <FaGraduationCap aria-hidden="true" /> : <FiUsers aria-hidden="true" />}
                      <span>{membership.title}</span>
                    </h2>
                    <p className={styles.audience}><strong>{membership.audience}</strong></p>
                  </div>
                  <img className={styles.photo} src={membership.image} alt={membership.imageAlt} width={120} height={144} />
                </div>
                <p className={styles.description}>{membership.description}</p>
                <ul className={styles.benefits}>
                  {membership.benefits.map(benefit => <li key={benefit}>{benefit}</li>)}
                </ul>
                <div className={styles.actions}>
                  <Link to={membership.href} className={styles.action}>
                    {membership.action}<FiArrowRight aria-hidden="true" />
                  </Link>
                  {membership.type === "alumni" && (
                    <Link to="/welcome-to-alumni" className={styles.learnMore}>Learn more about Alumni</Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="row mt--80 team_member_border_1">
            <div className="col-lg-12">
              <div className="text-center">
                <h4>Still Not Sure?</h4>
                <p className="mb--30">Contact us for more information about membership benefits and requirements.</p>
                <Link to="/contact" className="rn-button-style--2 rn-btn-reverse">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterTwo />
      <div className="backto-top">
        <ScrollToTop showUnder={160}><FiChevronUp size={26} /></ScrollToTop>
      </div>
    </>
  );
}
