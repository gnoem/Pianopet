import React, { useContext, useEffect, useRef, useState } from 'react';
import { ModalContext } from '../../contexts';
import { handleError } from '../../services';
import { Input } from './Input';
import { Button } from './Button';

export const Form = ({ children, title, submit, onSubmit, handleSuccess, handleFormError, reset, updateReset }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { createModal } = useContext(ModalContext);
    const formRef = useRef(null);
    useEffect(() => {
        console.log('reset changed');
        if (!reset) return;
        formRef?.current?.reset();
        updateReset(false);
    }, [reset, formRef.current]);
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        onSubmit()
            .then(result => {
                setSuccess(true);
                setLoading(false);
                setTimeout(() => {
                    setSuccess(false);
                    handleSuccess(result);
                }, 1200); // check + checkmark-shrink animation duration in Button.css
            })
            .catch(err => {
                setLoading(false);
                handleError(err, { handleFormError, createModal })
            });
    }
    const submitShouldInherit = { loading, success };
    const customSubmit = submit ? React.cloneElement(submit, submitShouldInherit) : null;
    return (
        <form onSubmit={handleSubmit} autoComplete="off" ref={formRef}>
            <h2>{title}</h2>
            {children}
            {customSubmit ?? <Submit {...submitShouldInherit} />}
        </form>
    );
}

export const Submit = ({ value, nvm, cancel, loading, success, disabled, buttonClass }) => {
    // todo change onCancel to just cancel
    return (
        <div className="buttons">
            <Button type="submit"
                    className={buttonClass}
                    {...{ success, loading, disabled }}>
                {value ?? 'Submit'}
            </Button>
            {(cancel !== false) && <button type="button" className="greyed" onClick={cancel}>{nvm ?? 'Cancel'}</button>}
        </div>
    );
}

export { Input, Button }