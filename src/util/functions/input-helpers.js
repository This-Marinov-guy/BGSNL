import * as yup from "yup";

export const buildSchemaExtraInputs = (extraInputsForm, defaultInputs = {}) => {
    const schemaFields = {};

    if (extraInputsForm && Array.isArray(extraInputsForm)) {
        extraInputsForm.forEach((input, index) => {
            const fieldName = `extraInput${index + 1}`;
            schemaFields[fieldName] = yup.string().required("Please fill");
        });
    }

    return yup.object().shape({...defaultInputs, ...schemaFields});
}