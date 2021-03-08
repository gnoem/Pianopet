import { useState, useEffect } from 'react';
import Input from './Input';

export default function Guest(props) {
    const [view, setView] = useState({ type: 'student', action: 'login' });
    const updateView = (type, action) => setView({ type, action });
    return (
        <div className="Guest">
            <div className="hero">
                <img alt="pianopet logo" src="assets/logo.svg" />
            </div>
            <div>
                {view.action === 'login' && <Login {...view} {...props} updateView={updateView} />}
                {view.action === 'signup' && <Signup {...view} {...props} updateView={updateView} />}
            </div>
        </div>
    );
}

function Login(props) {
    const { type } = props;
    const [formData, setFormData] = useState({});
    const [formError, setFormError] = useState({});
    useEffect(() => {
        setFormData({});
        setFormError({});
    }, [type]);
    const updateFormData = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const resetFormError = (e) => {
        setFormError(prevState => {
            const stateMinusFormError = {...prevState};
            delete stateMinusFormError[e.target.name];
            return stateMinusFormError;
        });
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        setFormError({});
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: type,
                ...formData
            })
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return setFormError(body.error);
        window.location.assign('/');
    }
    const uppercaseFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
    const oppositeType = type === 'student'
        ? 'teacher'
        : 'student';
    return (
        <div className="Login">
            <h1>{uppercaseFirstLetter(type)} Login</h1>
            <form onSubmit={handleLogin} autoComplete="off">
                <Input
                    type="text"
                    name="username"
                    label="Username"
                    onChange={updateFormData}
                    onInput={resetFormError}
                    error={formError?.username}
                />
                <Input
                    type="password"
                    name="password"
                    label="Password"
                    onChange={updateFormData}
                    onInput={resetFormError}
                    error={formError?.password}
                />
                <input type="submit" />
            </form>
            <span className="nowrap">Don't have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => props.updateView(type, 'signup')}>here</button> to sign up.
            </span>
            <button className="portalLink" onClick={() => props.updateView(oppositeType, 'login')}>
                &raquo; {uppercaseFirstLetter(oppositeType)} Portal
            </button>
        </div>
    )
}

function Signup(props) {
    const { type } = props;
    const [formData, setFormData] = useState({});
    const [formError, setFormError] = useState({});
    useEffect(() => setFormData({}), [type]);
    const updateFormData = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }
    const resetFormError = (e) => {
        setFormError(prevState => {
            const stateMinusFormError = {...prevState};
            delete stateMinusFormError[e.target.name];
            return stateMinusFormError;
        });
    }
    const handleSignup = async (e) => {
        e.preventDefault();
        setFormError({});
        const response = await fetch('/student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return setFormError(body.error);
        if (body.accessToken) window.location.assign('/');
        else return console.log('no token!!?');
    }
    const uppercaseFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
    const oppositeType = type === 'student'
        ? 'teacher'
        : 'student';
    return (
        <div className="Signup">
            <h1>{uppercaseFirstLetter(type)} Signup</h1>
            <form onSubmit={handleSignup} autoComplete="off" className="divide">
                <div className="half">
                    <div>
                        <Input
                            type="text"
                            name="firstName"
                            label="First name:"
                            onChange={updateFormData}
                            onInput={resetFormError}
                            error={formError?.firstName}
                        />
                    </div>
                    <div>
                        <Input
                            type="text"
                            name="lastName"
                            label="Last name:"
                            onChange={updateFormData}
                            onInput={resetFormError}
                            error={formError?.lastName}
                        />
                    </div>
                </div>
                <Input
                    type="text"
                    name="email"
                    label="Email address:"
                    onChange={updateFormData}
                    onInput={resetFormError}
                    error={formError?.email}
                />
                <span className="formHint">For password recovery only. We'll never send you marketing emails or share your contact information with third parties.</span>
                <div className="half" style={type === 'teacher' ? { marginBottom: '0' } : null}>
                    <div>
                        <Input
                            type="text"
                            name="username"
                            label="Choose a username:"
                            onChange={updateFormData}
                            onInput={resetFormError}
                            error={formError?.username}
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            name="password"
                            label="Choose a password:"
                            onChange={updateFormData}
                            onInput={resetFormError}
                            error={formError?.password}
                        />
                    </div>
                </div>
                {type === 'student' &&
                    <Input
                        type="text"
                        name="teacherCode"
                        label="Teacher code:"
                        onChange={updateFormData}
                        onInput={resetFormError}
                        error={formError?.teacherCode}
                    />
                }
                <input type="submit" />
            </form>
            <span className="nowrap">Already have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => props.updateView(type, 'login')}>here</button> to log in.
            </span>
            <button className="portalLink" onClick={() => props.updateView(oppositeType, 'login')}>
                &raquo; {uppercaseFirstLetter(oppositeType)} Portal
            </button>
        </div>
    )
}