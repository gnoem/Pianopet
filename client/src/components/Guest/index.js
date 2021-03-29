import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User } from '../../api';
import { useFormData, useFormError } from '../../hooks';
import { Form, Input, Submit } from '../Form';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}
const uppercaseFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const Guest = ({ signup, handleSuccess }) => {
    const [view, setView] = useState(() => {
        if (signup) return { type: 'student', action: 'signup' };
        return { type: 'student', action: 'login' };
    });
    let invite = useQuery().get('t');
    const updateView = (type, action) => setView({ type, action });
    const onSuccess = ({ user, isStudent }) => {
        handleSuccess({
            token: true,
            _id: user._id,
            isStudent
        });
        if (invite) window.history.pushState('', '', '/');
    }
    const oppositeType = (view.type === 'student') ? 'teacher' : 'student';
    return (
        <div className="Guest">
            <div className="hero">
                <img alt="pianopet logo" src="assets/logo.svg" />
            </div>
            <div>
                {view.action === 'login' && <Login {...view} {...{ oppositeType, updateView, onSuccess }} />}
                {view.action === 'signup' && <Signup {...view} {...{ oppositeType, updateView, onSuccess, invite }} />}
            </div>
        </div>
    );
}

function Login({ type, oppositeType, updateView, onSuccess }) {
    const [formReset, setFormReset] = useState(false);
    const [formData, updateFormData, setFormDataDirectly] = useFormData({ role: type });
    const [updateFormError, resetFormError, warnFormError, setFormErrorDirectly] = useFormError({});
    useEffect(() => {
        setFormDataDirectly({ role: type });
        setFormErrorDirectly({});
        setFormReset(true);
    }, [type]);
    const handleLogin = () => {
        setFormErrorDirectly({});
        return User.login(formData);
    }
    return (
        <div className="Login">
            <h1>{uppercaseFirstLetter(type)} Login</h1>
            <Form onSubmit={handleLogin} handleSuccess={onSuccess} handleFormError={updateFormError}
                  reset={formReset}
                  updateReset={setFormReset}
                  submit={<Submit cancel={false} />}>
                <Input
                    type="text"
                    name="username"
                    label="Username:"
                    defaultValue={formData?.username}
                    onChange={updateFormData}
                    onInput={resetFormError}
                    inputHint={warnFormError('username')} />
                <Input
                    type="password"
                    name="password"
                    label="Password:"
                    onChange={updateFormData}
                    onInput={resetFormError}
                    inputHint={warnFormError('password')} />
            </Form>
            <span className="nowrap">Don't have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => updateView(type, 'signup')}>here</button> to sign up.
            </span>
            <button className="portalLink" onClick={() => updateView(oppositeType, 'login')}>
                &raquo; {uppercaseFirstLetter(oppositeType)} Portal
            </button>
        </div>
    );
}

function Signup({ type, oppositeType, action, invite, updateView, onSuccess }) {
    const [formData, updateFormData, setFormDataDirectly] = useFormData({ role: type });
    const [updateFormError, resetFormError, warnFormError, setFormErrorDirectly] = useFormError({});
    const [teacherCodeIsValid, setTeacherCodeIsValid] = useState(null);
    useEffect(() => {
        if (!invite) return;
        const checkTeacherCode = async () => {
            const response = await fetch(`/teacherCode/${invite}`);
            const body = await response.json();
            if (!body.success) return setTeacherCodeIsValid(false);
            return setTeacherCodeIsValid(true);
        }
        checkTeacherCode();
        setFormDataDirectly(prevState => ({
            ...prevState,
            teacherCode: invite
        }));
    }, [invite]);
    useEffect(() => {
        if ((type === 'student') && (action === 'signup')) {
            setFormDataDirectly({
                role: 'student',
                teacherCode: invite
            });
            return;
        }
        setFormDataDirectly({ role: type });
    }, [type, invite, action]);
    const handleSignup = () => {
        setFormErrorDirectly({});
        return User.createAccount(formData);
    }
    const teacherCodeHint = () => {
        if (invite) {
            return (teacherCodeIsValid)
                ? { type: 'error', message: 'Invalid teacher code' }
                : { type: 'success', message: 'Looks good!' }
        }
        return null;
    }
    return (
        <div className="Signup">
            <h1>{uppercaseFirstLetter(type)} Signup</h1>
            <Form onSubmit={handleSignup} handleSuccess={onSuccess} handleFormError={updateFormError}
                  submit={<Submit cancel={false} />}
                  className="divide">
                <div className="half">
                    <Input
                        type="text"
                        name="firstName"
                        label="First name:"
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('firstName')} />
                    <Input
                        type="text"
                        name="lastName"
                        label="Last name:"
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('lastName')} />
                </div>
                <Input
                    type="text"
                    name="email"
                    label="Email address:"
                    onChange={updateFormData}
                    onInput={resetFormError}
                    inputHint={warnFormError('email')}
                    note="For password recovery only. We'll never send you marketing emails or share your contact information with third parties." />
                <div className="half" style={type === 'teacher' ? { marginBottom: '0' } : null}>
                    <Input
                        type="text"
                        name="username"
                        label="Choose a username:"
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('username')} />
                    <Input
                        type="password"
                        name="password"
                        label="Choose a password:"
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('password')} />
                </div>
                {type === 'student' && (
                    <Input
                        type="text"
                        name="teacherCode"
                        label="Teacher code:"
                        defaultValue={invite || ''}
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('teacherCode') ?? teacherCodeHint()} />
                )}
            </Form>
            {invite || <AlreadyHasAccount {...{ type, updateView }} />}
            {invite || <PortalLink {...{ oppositeType, updateView }} />}
        </div>
    );
}

const AlreadyHasAccount = ({ type, updateView }) => {
    return (
        <>
            <span className="nowrap">Already have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => updateView(type, 'login')}>here</button> to log in.
            </span>
        </>
    );
}

const PortalLink = ({ oppositeType, updateView }) => {
    return (
        <button className="portalLink" onClick={() => updateView(oppositeType, 'login')}>
            &raquo; {uppercaseFirstLetter(oppositeType)} Portal
        </button>
    );
}