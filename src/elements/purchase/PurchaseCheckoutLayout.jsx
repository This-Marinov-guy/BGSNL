import PropTypes from "prop-types";

export default function PurchaseCheckoutLayout({ sidebar, children }) {
  return (
    <div className="row team_member_border_1 team_border_long_add_on purchase-checkout-shell">
      <div className="col-12 purchase-checkout-content">
        <div className="purchase-event-sidebar">{sidebar}</div>
        <div className="col-12">{children}</div>
      </div>
    </div>
  );
}

PurchaseCheckoutLayout.propTypes = {
  sidebar: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};
