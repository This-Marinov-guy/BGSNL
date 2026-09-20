import PropTypes from "prop-types";

const EMPTY_ITEMS = [];

const CardItem = ({
  item,
  onClick = () => {},
  error = false,
  selected = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`purchase-addon-card${selected ? " is-selected" : ""}${error ? " has-error" : ""}`}
      aria-pressed={selected}
    >
      <span className="purchase-addon-card__copy">
        <strong>{item.title}</strong>
        {item.description && <span>{item.description}</span>}
      </span>
      <strong className="purchase-addon-card__price">
        {item?.price ? `+ €${item.price}` : "Free"}
      </strong>
    </button>
  );
};

const addOnShape = PropTypes.shape({
  _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  description: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string.isRequired,
});

CardItem.propTypes = {
  item: addOnShape.isRequired,
  onClick: PropTypes.func,
  error: PropTypes.bool,
  selected: PropTypes.bool,
};

const itemId = item => String(item?._id ?? item?.id ?? item ?? "");

const CardInputs = ({ items = EMPTY_ITEMS, onSelect, error, values = EMPTY_ITEMS, multi = false, valueMode = "object" }) => {
  if (items?.length === 0) {
    return null;
  }

  const handleSelect = (item) => {
    const id = itemId(item);
    const isSelected = values.some(value => itemId(value) === id);
    const nextItem = valueMode === "id" ? id : item;
    let newItems = [];
    if (isSelected) {
      newItems = values.filter(value => itemId(value) !== id);
    } else if (multi) {
      newItems = [...values, nextItem];
    } else {
      newItems = [nextItem];
    }
    onSelect(newItems);
  };

  return (
    <div className="purchase-addon-grid">
      {items.map((item) => {
        return (
          <CardItem
            key={itemId(item)}
            item={item}
            error={error}
            selected={values.some(value => itemId(value) === itemId(item))}
            onClick={() => handleSelect(item)}
          />
        );
      })}
    </div>
  );
};

CardInputs.propTypes = {
  items: PropTypes.arrayOf(addOnShape),
  onSelect: PropTypes.func.isRequired,
  error: PropTypes.bool,
  values: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ])
  ),
  multi: PropTypes.bool,
  valueMode: PropTypes.oneOf(["id", "object"]),
};

export default CardInputs;
