import { useState } from "react";
import { ErrorMessage } from "formik";
import PropTypes from "prop-types";
import PlusButton from "../../ui/buttons/PlusButton";
import XButton from "../../ui/buttons/XButton";

const emptyLink = () => ({ name: "", href: "" });

const normalizeSubEvent = (value) => ({
  ...value,
  description: value?.description ?? "",
  links:
    Array.isArray(value?.links) && value.links.length > 0
      ? value.links
      : [emptyLink()],
});

const LinkedErrorMessage = ({ name }) => (
  <ErrorMessage name={name}>
    {(message) =>
      typeof message === "string" ? (
        <div className="error" data-validation-message-for={name}>
          {message}
        </div>
      ) : null
    }
  </ErrorMessage>
);

LinkedErrorMessage.propTypes = {
  name: PropTypes.string.isRequired,
};

const SubEventBuilder = ({ initialValues, name, onChange }) => {
    const [input, setInput] = useState(() => normalizeSubEvent(initialValues));

    const updateInput = (nextInput) => {
        setInput(nextInput);
        onChange(nextInput);
    };

    const addLink = () => {
        updateInput({
            ...input,
            links: [...input.links, emptyLink()]
        });
    };

    const removeLink = (linkIndex) => {
        if (input.links.length > 1) {
            updateInput({
                ...input,
                links: input.links.filter((_, index) => index !== linkIndex)
            });
        }
    };

    const handleLinkChange = (linkIndex, field, value) => {
        updateInput({
            ...input,
            links: input.links.map((link, index) =>
                index === linkIndex ? { ...link, [field]: value } : link
            )
        });
    };

    const handleDescriptionChange = (value) => {
        updateInput({
            ...input,
            description: value
        });
    };

    const descriptionName = `${name}.description`;
    const linksName = `${name}.links`;

    return (
        <div
            className="row"
            data-custom-validation-field
            data-field-name={name}
        >
            <div className="col-12 mt--20">
                <h5>Link a sub-event (it will appear below the main to navigate the users to related events)</h5>
                <div
                    className="rn-form-group"
                    data-custom-validation-field
                    data-field-name={descriptionName}
                >
                    <input
                        type="text"
                        name={descriptionName}
                        placeholder="Type the description"
                        onChange={(event) =>
                            handleDescriptionChange(event.target.value)
                        }
                        value={input.description}
                    />
                    <LinkedErrorMessage name={descriptionName} />
                </div>
                <div
                    className="row mt--10 mb--10"
                    data-custom-validation-field
                    data-field-name={linksName}
                >
                    <LinkedErrorMessage name={linksName} />
                    {input.links.map((link, linkIndex) => (
                        <div
                            className="center_div_col col-4 mb--10"
                            data-custom-validation-field
                            data-field-name={`${linksName}[${linkIndex}]`}
                            key={`${linksName}[${linkIndex}]`}
                        >
                            <div
                                className="rn-form-group"
                                data-custom-validation-field
                                data-field-name={`${linksName}[${linkIndex}].name`}
                            >
                                <input
                                    type="text"
                                    name={`${linksName}[${linkIndex}].name`}
                                    placeholder="Name"
                                    value={link.name}
                                    onChange={(event) =>
                                        handleLinkChange(
                                            linkIndex,
                                            "name",
                                            event.target.value
                                        )
                                    }
                                />
                                <LinkedErrorMessage
                                    name={`${linksName}[${linkIndex}].name`}
                                />
                            </div>
                            <div
                                className="rn-form-group"
                                data-custom-validation-field
                                data-field-name={`${linksName}[${linkIndex}].href`}
                            >
                                <input
                                    type="text"
                                    name={`${linksName}[${linkIndex}].href`}
                                    placeholder="Link"
                                    value={link.href}
                                    onChange={(event) =>
                                        handleLinkChange(
                                            linkIndex,
                                            "href",
                                            event.target.value
                                        )
                                    }
                                />
                                <LinkedErrorMessage
                                    name={`${linksName}[${linkIndex}].href`}
                                />
                            </div>
                            <div className="mt--10 center_div">
                                <XButton onClick={() => removeLink(linkIndex)} />
                                <PlusButton onClick={addLink} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

SubEventBuilder.propTypes = {
    initialValues: PropTypes.shape({
        description: PropTypes.string,
        links: PropTypes.arrayOf(
            PropTypes.shape({
                href: PropTypes.string,
                name: PropTypes.string,
            })
        ),
    }),
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default SubEventBuilder;
