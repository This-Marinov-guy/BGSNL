import React from "react";
import PropTypes from "prop-types";
import { Badge } from "primereact/badge";
import { FiCheck } from "react-icons/fi";

const CardItem = ({
  item,
  onClick = () => {},
  error = false,
  selected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`card card-1 common-border-1 ${!!selected && "card-active"} ${
        error && "error-border"
      } card-price`}
      style={{ margin: "10px auto" }}
    >
      {!!selected && (
        <Badge value={<FiCheck />} size="medium" className="card-badge"></Badge>
      )}

      <div className="d-flex flex-column justify-content-center align-items-center">
        <h4>{item.title}</h4>
        {item.description && (
          <h6>{item.description}</h6>
        )}
        <h4>{item?.price ? `+ ${item.price} euro` : "Free"}</h4>
      </div>
    </div>
  );
};

const CardInputs = ({ items = [], onSelect, error, values = [], multi = false }) => {
  if (items?.length == 0) {
    return null;
  }

  const handleSelect = (item) => {
    let newItems = [];
    if (values.find((i) => i._id === item._id)) {
      newItems = values.filter((i) => i._id !== item._id);
    } else if (multi) {
      newItems = [...values, item];
    } else {
      newItems = [item];
    }
    onSelect(newItems);
  };

  return (
    <div className="row">
      {items.map((item, index) => {
        return (
          <CardItem
            key={index}
            item={item}
            error={error}
            selected={values.find((i) => i._id === item._id)}
            onClick={() => handleSelect(item)}
          />
        );
      })}
    </div>
  );
};

CardInputs.propTypes = {
  items: PropTypes.array,
  onSelect: PropTypes.func,
  error: PropTypes.bool,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
};

export default CardInputs;
