import { useState, useEffect } from 'react';

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
    const [formData, setFormData] = useState({
        username: 'daniel',
        password: 'kjhg'
    });
    const [formError, setFormError] = useState({});
    useEffect(() => {
        setFormData({
            username: '',
            password: ''
        });
        setFormError({});
    }, [type]);
    const updateFormData = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        const { username, password } = formData;
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: type,
                username,
                password
            })
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return setFormError(body.errors);
        window.location.assign('/');
    }
    const showError = {
        username: () => {
            if (!formError || !formError.username) return null;
            if (formError.username) return <span className="error">{formError.username}</span>;
        },
        password: () => {
            if (!formError || !formError.password) return null;
            if (formError.password) return <span className="error">{formError.password}</span>;
        }
    }
    const state = {
        formData,
        formError,
        resetFormError: () => setFormError({}),
        updateFormData,
        handleLogin,
        showError
    }
    switch (type) {
        case 'student': return <StudentLogin {...props} {...state} />;
        case 'teacher': return <TeacherLogin {...props} {...state} />;
        default: return null;
    }
}

function StudentLogin(props) {
    const { showError } = props;
    return (
        <div className="Login">
            <h1>Student Login</h1>
            <form onSubmit={props.handleLogin} autoComplete="off">
                <label htmlFor="username">Username:</label>
                <input name="username" type="text" onInput={props.resetFormError} onChange={props.updateFormData} />
                {showError.username()}
                <label htmlFor="password">Password:</label>
                <input name="password" type="password" onInput={props.resetFormError} onChange={props.updateFormData} />
                {showError.password()}
                <input type="submit" />
            </form>
            <span className="nowrap">Don't have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => props.updateView('student', 'signup')}>here</button> to sign up.
            </span>
            <button className="portalLink" onClick={() => props.updateView('teacher', 'login')}>&raquo; Teacher Portal</button>
        </div>
    );
}

function TeacherLogin(props) {
    const { showError } = props;
    return (
        <div className="Login">
            <h1>Teacher Login</h1>
            <form onSubmit={props.handleLogin} autoComplete="off">
                <label htmlFor="username">Username:</label>
                <input name="username" type="text" onInput={props.resetFormError} onChange={props.updateFormData} />
                {showError.username()}
                <label htmlFor="password">Password:</label>
                <input name="password" type="password" onInput={props.resetFormError} onChange={props.updateFormData} />
                {showError.password()}
                <input type="submit" />
            </form>
            <span className="nowrap">Don't have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => props.updateView('teacher', 'signup')}>here</button> to sign up.
            </span>
            <button className="portalLink" onClick={() => props.updateView('student', 'login')}>&raquo; Student Portal</button>
        </div>
    )
}

function Signup(props) {
    const { type } = props;
    const [formData, setFormData] = useState({});
    useEffect(() => setFormData({}), [type]);
    const updateFormData = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }
    const handleSignup = async (e) => {
        e.preventDefault();
        const response = await fetch('/student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return console.log('server working but something went wrong');
        if (body.accessToken) window.location.assign('/');
        else return console.log('no token!!?');
    }
    const functions = {
        updateFormData,
        handleSignup
    }
    switch (type) {
        case 'student': return <StudentSignup {...props} {...functions} />;
        case 'teacher': return <TeacherSignup {...props} {...functions} />;
        default: return null;
    }
}

function StudentSignup(props) {
    return (
        <div className="Signup">
            <h1>Student Signup</h1>
            <form onSubmit={props.handleSignup} autoComplete="off">
                <label htmlFor="firstName">First name:</label>
                <input name="firstName" type="text" onChange={props.updateFormData} />
                <label htmlFor="lastName">Last name:</label>
                <input name="lastName" type="text" onChange={props.updateFormData} />
                <label htmlFor="username">Choose a username:</label>
                <input name="username" type="text" onChange={props.updateFormData} />
                <label htmlFor="password">Choose a password:</label>
                <input name="password" type="password" onChange={props.updateFormData} />
                <label htmlFor="teacherCode">Teacher code:</label>
                <input name="teacherCode" type="text" onChange={props.updateFormData} />
                <input type="submit" />
            </form>
            <span className="nowrap">Already have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => props.updateView('student', 'login')}>here</button> to log in.
            </span>
            <button className="portalLink" onClick={() => props.updateView('teacher', 'login')}>&raquo; Teacher Portal</button>
        </div>
    )
}

function TeacherSignup(props) {
    return (
        <div className="Signup">
            <h1>Teacher Signup</h1>
            <form onSubmit={props.handleSignup} autoComplete="off">
                <label htmlFor="firstName">First name:</label>
                <input name="firstName" type="text" onChange={props.updateFormData} />
                <label htmlFor="lastName">Last name:</label>
                <input name="lastName" type="text" onChange={props.updateFormData} />
                <label htmlFor="username">Choose a username:</label>
                <input name="username" type="text" onChange={props.updateFormData} />
                <label htmlFor="password">Choose a password:</label>
                <input name="password" type="password" onChange={props.updateFormData} />
                <input type="submit" />
            </form>
            <span className="nowrap">Already have an account?</span>
            <span className="nowrap">
                Click <button className="stealth link" onClick={() => props.updateView('teacher', 'login')}>here</button> to log in.
            </span>
            <button className="portalLink" onClick={() => props.updateView('student', 'login')}>&raquo; Student Portal</button>
        </div>
    );
}