import React, { useContext, useEffect, useRef, useState } from "react";
import { ModalContext } from "../../contexts";
import { handleError } from "../../services";
import { Input, InputDropdown } from "./Input";
import { Checkbox } from "./Checkbox";
import { Button } from "./Button";

export const Form = ({ children, modal, className, title, submit, onSubmit, handleSuccess, handleFormError, reset, updateReset }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { createModal, closeModal } = useContext(ModalContext);
    const formRef = useRef(null);
    useEffect(() => {
        if (!reset) return;
        formRef?.current?.reset();
        updateReset(false);
    }, [reset, formRef.current]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading || success) return; // prevent multiple form submissions from spamming button
        setLoading(true);
        onSubmit()
            .then(result => {
                setSuccess(true);
                setLoading(false);
                setTimeout(() => {
                    if (!modal) setSuccess(false);
                    else closeModal();
                    handleSuccess(result);
                }, 1200); // check + checkmark-shrink animation duration in Button.css
            })
            .catch(err => {
                setLoading(false);
                handleError(err, { handleFormError, createModal })
            });
    }
    const submitShouldInherit = { loading, success, modal, closeModal };
    const customSubmit = submit ? React.cloneElement(submit, submitShouldInherit) : null;
    return (
        <form onSubmit={handleSubmit}
              autoComplete="off"
              className={className ?? ''}
              ref={formRef}>
            {title && <h2>{title}</h2>}
            {children}
            {customSubmit ?? <Submit {...submitShouldInherit} />}
        </form>
    );
}

export const Submit = ({ value, modal, nvm, cancel, closeModal, loading, success, disabled, buttonClass }) => {
    // todo change onCancel to just cancel
    const handleCancel = () => {
        cancel?.();
        if (modal) closeModal();
    }
    return (
        <div className="buttons">
            <Button type="submit"
                    className={buttonClass}
                    {...{ success, loading, disabled }}>
                {value ?? 'Submit'}
            </Button>
            {(cancel !== false) && <button type="button" className="greyed" onClick={handleCancel}>{nvm ?? 'Cancel'}</button>}
        </div>
    );
}

export { Input, InputDropdown, Checkbox, Button }