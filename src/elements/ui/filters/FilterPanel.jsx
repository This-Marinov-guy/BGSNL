import PropTypes from "prop-types";
import styles from "./filter-panel.module.scss";

const classes = (...values) => values.filter(Boolean).join(" ");

/**
 * Shared filter surface. Screens provide their own controls through children
 * and can override only the controls grid when a particular layout needs it.
 */
const FilterPanel = ({
  children,
  className = "",
  controlsClassName = "",
  description = "",
  summary = null,
  title = "Filters",
}) => (
  <section
    aria-label={typeof title === "string" ? title : "Filters"}
    className={classes(styles.panel, className)}
  >
    <header className={styles.header}>
      <div className={styles.heading}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {summary ? <div className={styles.summary}>{summary}</div> : null}
    </header>
    <div className={classes(styles.controls, controlsClassName)}>{children}</div>
  </section>
);

FilterPanel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  controlsClassName: PropTypes.string,
  description: PropTypes.node,
  summary: PropTypes.node,
  title: PropTypes.node,
};

export default FilterPanel;
