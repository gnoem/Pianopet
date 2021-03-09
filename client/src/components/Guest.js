import { useState, useEffect } from 'react';
import Input from './Input';
import { useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function Guest(props) {
    const { signup } = props;
    const [view, setView] = useState(() => {
        if (signup) return { type: 'student', action: 'signup' };
        return { type: 'student', action: 'login' };
    });
    let invite = useQuery().get('t');
    const updateView = (type, action) => setView({ type, action });
    return (
        <div className="Guest">
            <div className="hero">
                <img alt="pianopet logo" src="assets/logo.svg" />
            </div>
            <div>
                {view.action === 'login' && <Login {...view} {...props} updateView={updateView} />}
                {view.action === 'signup' && <Signup {...view} {...props} invite={invite} updateView={updateView} />}
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
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
        return { type: null, message: null };
    }
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
                    hint={inputHint('username')}
                />
                <Input
                    type="password"
                    name="password"
                    label="Password"
                    onChange={updateFormData}
                    onInput={resetFormError}
                    hint={inputHint('password')}
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
    const { type, action, invite } = props;
    const [formData, setFormData] = useState({});
    const [formError, setFormError] = useState({});
    const [teacherCodeIsValid, setTeacherCodeIsValid] = useState(null);
    useEffect(() => {
        if (!invite) return;
        const checkTeacherCode = async () => {
            const response = await fetch(`/teacherCode/${invite}`);
            const body = await response.json();
            if (!body.success) return setFormError(prevState => ({
                ...prevState,
                teacherCode: 'Invalid teacher code'
            }));
            if (body.teacher) return setTeacherCodeIsValid(`Teacher: ${body.teacher.firstName} ${body.teacher.lastName}`);
            return setTeacherCodeIsValid(`Looks good!`);
        }
        checkTeacherCode();
        setFormData(prevState => ({
            ...prevState,
            teacherCode: invite
        }));
    }, [invite]);
    useEffect(() => {
        if ((type === 'student') && (action === 'signup')) return setFormData({ teacherCode: invite });
        return setFormData({});
    }, [type, invite, action]);
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
        console.dir(formData);
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
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
        return { type: null, message: null };
    }
    const teacherCodeHint = () => {
        if (formError?.teacherCode) return { type: 'error', message: formError?.teacherCode };
        if (invite && teacherCodeIsValid) return { type: 'success', message: teacherCodeIsValid }
        return { type: null, message: null };
    }
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
                            hint={inputHint('firstName')}
                        />
                    </div>
                    <div>
                        <Input
                            type="text"
                            name="lastName"
                            label="Last name:"
                            onChange={updateFormData}
                            onInput={resetFormError}
                            hint={inputHint('lastName')}
                        />
                    </div>
                </div>
                <Input
                    type="text"
                    name="email"
                    label="Email address:"
                    onChange={updateFormData}
                    onInput={resetFormError}
                    hint={inputHint('email')}
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
                            hint={inputHint('username')}
                        />
                    </div>
                    <div>
                        <Input
                            type="password"
                            name="password"
                            label="Choose a password:"
                            onChange={updateFormData}
                            onInput={resetFormError}
                            hint={inputHint('password')}
                        />
                    </div>
                </div>
                {type === 'student' &&
                    <Input
                        type="text"
                        name="teacherCode"
                        label="Teacher code:"
                        defaultValue={invite || ''}
                        onChange={updateFormData}
                        onInput={resetFormError}
                        hint={teacherCodeHint()}
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