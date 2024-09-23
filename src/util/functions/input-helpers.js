import * as yup from "yup";

// Good luck understanding this :) !!!

export const buildSchemaExtraInputs = (extraInputsForm, defaultSchema = null) => {
    const schema = defaultSchema || yup.object().shape({});
    const extraFields = {};

    if (extraInputsForm && Array.isArray(extraInputsForm)) {
        extraInputsForm.forEach((input) => {
            const fieldName = input.placeholder;

            if (input.type === 'select' && input.multiselect) {
                extraFields[fieldName] = input.required
                    ? yup.array().min(1, "Please select at least one option").of(yup.string())
                    : yup.array().of(yup.string());
            } else {
                extraFields[fieldName] = input.required
                    ? yup.string().required("This field is required")
                    : yup.string();
            }
        });
    }

    return { schema: schema.shape(extraFields), schemaFields: extraFields }
};

export const appendExtraInputsToForm = (formData, schemaFields, values, key = 'preferences') => {
    formData.append(key, JSON.stringify(Object.keys(schemaFields).reduce((obj, key) => {
        if (Array.isArray(values[key])) {
            obj[key] = values[key].join(', ');
        } else {
            obj[key] = values[key];
        }
        return obj;
    }, {})))
}

export const constructInitialExtraFormValues = (extraInputsForm) => {
    if (!extraInputsForm) {
        return {}
    }

    return extraInputsForm?.reduce((acc, value) => {
        acc[`${value.placeholder}`] = '';
        return acc;
    }, {})
}