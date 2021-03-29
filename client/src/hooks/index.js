import { useState } from 'react';

export const useFormData = (initialState = {}) => {
    const [formData, setFormData] = useState(initialState);
    const updateFormData = (e) => setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    const setFormDataDirectly = setFormData;
    const resetFormData = () => setFormData(initialState);
    return [formData, updateFormData, setFormDataDirectly, resetFormData];
}

export const useFormError = (initialState = {}) => {
    const [formError, setFormError] = useState(initialState);
    const updateFormError = (errors) => setFormError(prevState => ({ ...prevState, ...errors }));
    const resetFormError = (e) => setFormError(prevState => {
        if (!prevState?.[e.target.name]) return prevState;
        const newState = {...prevState};
        delete newState[e.target.name];
        return newState;
    });
    const warnFormError = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
    }
    const setFormErrorDirectly = () => setFormError(initialState);
    return [updateFormError, resetFormError, warnFormError, setFormErrorDirectly];
}