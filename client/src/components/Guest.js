import React, { Component } from 'react';

class Guest extends Component {
    constructor(props) {
        super(props);
        this.updateView = this.updateView.bind(this);
        this.state = {
            type: 'student',
            view: 'login'
        }
    }
    updateView = (type, view) => {
        this.setState({ type: type, view: view });
    }
    render() {
        const { type, view } = this.state;
        const studentPortal = () => {
            if (view === 'login') return <StudentLogin {...this.props} updateView={this.updateView} />;
            if (view === 'signup') return <StudentSignup {...this.props} updateView={this.updateView} />;
        }
        const teacherPortal = () => {
            if (view === 'login') return <TeacherLogin {...this.props} updateView={this.updateView} />;
            if (view === 'signup') return <TeacherSignup {...this.props} updateView={this.updateView} />;
        }
        return (
            <div className="Guest">
                <div className="hero">
                    <img alt="pianopet logo" src="assets/logo.svg" />
                </div>
                {type === 'student' && studentPortal()}
                {type === 'teacher' && teacherPortal()}
            </div>
        )
    }
}

class StudentLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleLogin = async (e) => {
        e.preventDefault();
        const { username, password } = this.state;
        const response = await fetch('/student/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return console.log('server working but something went wrong');
        if (body.accessToken) window.location.assign('/');
        else return console.log('no token!!?');
    }
    render() {
        return (
            <div className="Login">
                <h1>Student Login</h1>
                <form onSubmit={this.handleLogin} autoComplete="off">
                    <label htmlFor="username">Username:</label>
                    <input type="text" onChange={(e) => this.setState({ username: e.target.value })} />
                    <label htmlFor="password">Password:</label>
                    <input type="password" onChange={(e) => this.setState({ password: e.target.value })} />
                    <input type="submit" />
                </form>
                Don't have an account? Click <button className="stealth link" onClick={() => this.props.updateView('student', 'signup')}>here</button> to sign up.
                <button className="cornerButton" onClick={() => this.props.updateView('teacher', 'login')}>&raquo; Teacher Portal</button>
            </div>
        )
    }
}

class StudentSignup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleSignup = async (e) => {
        e.preventDefault();
        const { firstName, lastName, username, password, teacherCode } = this.state;
        const response = await fetch('/student/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                username: username,
                password: password,
                teacherCode: teacherCode
            })
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return console.log('server working but something went wrong');
        if (body.accessToken) window.location.assign('/');
        else return console.log('no token!!?');
    }
    render() {
        return (
            <div className="Signup">
                <h1>Student Signup</h1>
                <form onSubmit={this.handleSignup} autoComplete="off">
                    <label htmlFor="firstName">First name:</label>
                    <input type="text" onChange={(e) => this.setState({ firstName: e.target.value })} />
                    <label htmlFor="lastName">Last name:</label>
                    <input type="text" onChange={(e) => this.setState({ lastName: e.target.value })} />
                    <label htmlFor="username">Choose a username:</label>
                    <input type="text" onChange={(e) => this.setState({ username: e.target.value })} />
                    <label htmlFor="password">Choose a password:</label>
                    <input type="password" onChange={(e) => this.setState({ password: e.target.value })} />
                    <label htmlFor="teacherCode">Teacher code:</label>
                    <input type="text" onChange={(e) => this.setState({ teacherCode: e.target.value })} />
                    <input type="submit" />
                </form>
                Already have an account? Click <button className="stealth link" onClick={() => this.props.updateView('student', 'login')}>here</button> to log in.
                <button className="cornerButton" onClick={() => this.props.updateView('teacher', 'login')}>&raquo; Teacher Portal</button>
            </div>
        )
    }
}

class TeacherLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleLogin = async (e) => {
        e.preventDefault();
        const { username, password } = this.state;
        const response = await fetch('/teacher/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return console.log('server working but something went wrong');
        if (body.accessToken) window.location.assign('/');
        else return console.log('no token!!?');
    }
    render() {
        return (
            <div className="Login">
                <h1>Teacher Login</h1>
                <form onSubmit={this.handleLogin} autoComplete="off">
                    <label htmlFor="username">Username:</label>
                    <input type="text" onChange={(e) => this.setState({ username: e.target.value })} />
                    <label htmlFor="password">Password:</label>
                    <input type="password" onChange={(e) => this.setState({ password: e.target.value })} />
                    <input type="submit" />
                </form>
                Don't have an account? Click <button className="stealth link" onClick={() => this.props.updateView('teacher', 'signup')}>here</button> to sign up.
                <button className="cornerButton" onClick={() => this.props.updateView('student', 'login')}>&raquo; Student Portal</button>
            </div>
        )
    }
}

class TeacherSignup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleSignup = async (e) => {
        e.preventDefault();
        const { username, password } = this.state;
        const response = await fetch('/teacher/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return console.log('server working but something went wrong');
        if (body.accessToken) window.location.assign('/');
        else return console.log('no token!!?');
    }
    render() {
        return (
            <div className="Signup">
                <h1>Student Signup</h1>
                <form onSubmit={this.handleSignup} autoComplete="off">
                    <label htmlFor="username">Choose a username:</label>
                    <input type="text" onChange={(e) => this.setState({ username: e.target.value })} />
                    <label htmlFor="password">Choose a password:</label>
                    <input type="password" onChange={(e) => this.setState({ password: e.target.value })} />
                    <input type="submit" />
                </form>
                Already have an account? Click <button className="stealth link" onClick={() => this.props.updateView('teacher', 'login')}>here</button> to log in.
                <button className="cornerButton" onClick={() => this.props.updateView('student', 'login')}>&raquo; Student Portal</button>
            </div>
        )
    }
}


export default Guest;