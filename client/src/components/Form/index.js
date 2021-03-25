import React, { useState } from 'react';
import { handleError } from '../../services';
import { Input } from './Input';
import { Button } from './Button';

export const Form = ({ children, title, submit, onSubmit, handleSuccess, handleFormError, updateModal }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        onSubmit()
            .then(() => {
                setSuccess(true);
                setLoading(false);
                setTimeout(() => {
                    setSuccess(false);
                    handleSuccess();
                }, 500);
            })
            .catch(err => {
                setLoading(false);
                handleError(err, { handleFormError, updateModal })
            });
    }
    const submitShouldInherit = { loading, success };
    const customSubmit = submit ? React.cloneElement(submit, submitShouldInherit) : null;
    return (
        <form onSubmit={handleSubmit} autoComplete="off">
            <h2>{title}</h2>
            {children}
            {customSubmit ?? <Submit {...submitShouldInherit} />}
        </form>
    );
}

export const Submit = ({ value, nvm, cancel, loading, buttonClass, onCancel }) => {
    // todo change onCancel to just cancel
    return (
        <div className="buttons">
            <Button type="submit"
                    className={buttonClass}
                    loading={loading}>
                {value ?? 'Submit'}
            </Button>
            {(cancel !== false) && <button type="button" className="greyed" onClick={onCancel}>{nvm ?? 'Cancel'}</button>}
        </div>
    );
}

export { Input, Button }