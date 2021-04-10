import "./AccountAccess.css";
import { useState, useEffect, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Teacher, User } from "../../api";
import { useFormData, useFormError } from "../../hooks";
import { Guest } from "../Guest";
import { Form, Input, Submit } from "../Form";
import { handleError } from "../../services";
import { ModalContext } from "../../contexts";
import { Loading } from "../Loading";
import { ChangePassword } from "../Account";

const useQuery = () => new URLSearchParams(useLocation().search);

const uppercaseFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const AccountAccess = ({ type, action, handleSuccess, createModal }) => {
    const [view, setView] = useState(() => {
        if (action) return { type, action };
        return { type: 'student', action: 'login' };
    });
    let invite = useQuery().get('t');
    const { pathname } = useLocation();
    const { userType, recoveryToken } = useParams();
    useEffect(() => {
        if (pathname === '/demo') {
            createModal('demoAlert', 'customAlert');
        }
    }, [pathname]);
    const updateView = (type, action) => setView({ type, action });
    const onSuccess = ({ user, isStudent }) => {
        if (action) return window.location.assign('/');
        handleSuccess({
            token: true,
            _id: user._id,
            isStudent
        });
    }
    const oppositeType = (view.type === 'student') ? 'teacher' : 'student';
    return (
        <Guest className="AccountAccess">
            {view.action === 'recovery' &&
                <PasswordRecovery {...{ userType, recoveryToken, createModal }} />}
            {view.action === 'login' &&
                <Login {...view} {...{ oppositeType, updateView, onSuccess, createModal }} />}
            {view.action === 'signup' &&
                <Signup {...view} {...{ oppositeType, updateView, onSuccess, invite }} />}
        </Guest>
    );
}

const Login = ({ type, oppositeType, updateView, onSuccess, createModal }) => {
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
    const resetPassword = () => createModal('resetPassword', 'form', { type });
    const forgotPasswordNote = (
        <>Forgot password? Click <button type="button" className="stealth link" onClick={resetPassword}>here</button> to reset it.</>
    );
    return (
        <div className="AccountAccess Login">
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
                    inputHint={warnFormError('password')}
                    note={forgotPasswordNote} />
            </Form>
            <span className="nowrap">Don't have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => updateView(type, 'signup')}>here</button> to sign up.
            </span>
            <PortalLink {...{ oppositeType, updateView }} />
        </div>
    );
}

const Signup = ({ type, oppositeType, action, invite, updateView, onSuccess }) => {
    const { createModal } = useContext(ModalContext);
    const [formData, updateFormData, setFormDataDirectly] = useFormData({ role: type });
    const [updateFormError, resetFormError, warnFormError, setFormErrorDirectly] = useFormError({});
    const [teacherCodeIsValid, setTeacherCodeIsValid] = useState(null);
    useEffect(() => {
        if (!invite) return;
        Teacher.validateTeacherCode(invite).then(({ isValid }) => {
            setTeacherCodeIsValid(isValid);
            if (isValid) setFormDataDirectly(prevState => ({
                ...prevState,
                teacherCode: invite
            }));
        }).catch(err => {
            setTeacherCodeIsValid(false);
            handleError(err, { createModal });
        });
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
            if (teacherCodeIsValid == null) return {};
            const success = {
                type: 'success',
                message: 'Looks good!'
            }
            const invalid = {
                type: 'error',
                message: 'Invalid teacher code'
            }
            return teacherCodeIsValid ? success : invalid;
        }
        return null;
    }
    return (
        <div className="AccountAccess Signup">
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
            {(invite == null) && (
                <>
                    <AlreadyHasAccount {...{ type, updateView }} />
                    <PortalLink {...{ oppositeType, updateView }} />
                </>
            )}
        </div>
    );
}

const PasswordRecovery = ({ userType, recoveryToken, createModal }) => {
    const [tokenIsValid, setTokenIsValid] = useState(null);
    const [userId, setUserId] = useState(null);
    useEffect(() => {
        if (!recoveryToken) return setTokenIsValid(false);
        User.validateRecoveryToken(recoveryToken).then(({ isValid, userId }) => {
            setUserId(userId);
            setTokenIsValid(isValid);
        }).catch(err => {
            setTokenIsValid(false);
            handleError(err, { createModal });
        });
    }, [recoveryToken]);
    return (
        <div className="PasswordRecovery">
            <h1>Reset your password</h1>
            {(tokenIsValid == null) &&
                <Loading />}
            {(tokenIsValid === false) &&
                <InvalidRecoveryToken {...{ userType, createModal }} />}
            {(tokenIsValid === true) &&
                <ValidRecoveryToken {...{ userType, userId }} />}
        </div>
    );
}

const ValidRecoveryToken = ({ userType, userId }) => {
    const [success, setSuccess] = useState(false);
    const user = { _id: userId };
    const isStudent = userType === 'student';
    const handleContinue = () => {
        window.location.assign('/');
    }
    if (success) return (
        <div>
            <h2>Success!</h2>
            <p>Your password has been reset.</p>
            <div className="buttons">
                <button type="button" onClick={handleContinue}>Continue</button>
            </div>
        </div>
    );
    return (
        <ChangePassword {...{
            resetMode: true,
            resetPasswordSuccess: () => setSuccess(true),
            user,
            isStudent
        }} />
    );
}

const InvalidRecoveryToken = ({ userType, createModal }) => {
    const handleClick = () => createModal('resetPassword', 'form', { type: userType });
    return (
        <div>
            Sorry, this link is invalid or expired. If you are trying to reset your password, click <button className="stealth link" onClick={handleClick}>here</button> to generate a new password recovery link.
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
        <div className="portalLink">
            <button onClick={() => updateView(oppositeType, 'login')}>
                &raquo; {uppercaseFirstLetter(oppositeType)} Portal
            </button>
        </div>
    );
}