import * as yup from "yup";

// Good luck understanding this :) !!!

export const extraInputFieldName = (index) => `extraInput_${index}`;

const isTrueLike = (value) => value === true || value === "true";

export const buildSchemaExtraInputs = (extraInputsForm, defaultSchema = null) => {
    const schema = defaultSchema || yup.object().shape({});
    const extraFields = {};

    if (extraInputsForm && Array.isArray(extraInputsForm)) {
        extraInputsForm.forEach((input, index) => {
            const fieldName = extraInputFieldName(index);

            if (input.type === 'select' && isTrueLike(input.multiselect)) {
                extraFields[fieldName] = isTrueLike(input.required)
                    ? yup.array().min(1, "Please select at least one option").of(yup.string())
                    : yup.array().of(yup.string());
            } else {
                extraFields[fieldName] = isTrueLike(input.required)
                    ? yup.string().required("This field is required")
                    : yup.string();
            }
        });
    }

    return { schema: schema.shape(extraFields), schemaFields: extraFields }
};

export const appendExtraInputsToForm = (
    formData,
    schemaFields,
    values,
    extraInputsForm,
    key = 'preferences'
) => {
    formData.append(key, JSON.stringify(Object.keys(schemaFields).reduce((obj, fieldName, index) => {
        const outputName = extraInputsForm?.[index]?.placeholder ?? fieldName;
        if (Array.isArray(values[fieldName])) {
            obj[outputName] = values[fieldName].join(', ');
        } else {
            obj[outputName] = values[fieldName];
        }
        return obj;
    }, {})))
}

export const constructInitialExtraFormValues = (extraInputsForm) => {
    if (!extraInputsForm) {
        return {}
    }

    return extraInputsForm?.reduce((acc, input, index) => {
        const isMultiselect =
            input?.type === 'select' && isTrueLike(input.multiselect);
        acc[extraInputFieldName(index)] = isMultiselect ? [] : '';
        return acc;
    }, {})
}
