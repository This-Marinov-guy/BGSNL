

const useFormikError = () => {
    const toast = useToast();
    const script = useSelector(selectScript);

    const handleError = (errors, isValid, dirty) => {
        if (errors && !isValid && !dirty) {
            //display error
        }
    }

    return handleError;
}

export default useFormikError;