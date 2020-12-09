import React, { Component } from 'react';

class Guest extends Component {
    constructor(props) {
        super(props);
        this.updateView = this.updateView.bind(this);
        this.state = {
            view: 'login'
        }
    }
    updateView = (view) => {
        this.setState({ view: view });
    }
    render() {
        const { view } = this.state;
        const form = () => {
            if (view === 'login') return <Login updateView={this.updateView} />;
            if (view === 'signup') return <Signup updateView={this.updateView} />;
        }
        return (
            <div className="Guest">
                <div className="hero"></div>
                {form()}
            </div>
        )
    }
}

class Login extends Component {
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
                Don't have an account? Click <button className="stealth link" onClick={() => this.props.updateView('signup')}>here</button> to sign up.
            </div>
        )
    }
}

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    handleSignup = async (e) => {
        e.preventDefault();
        const { username, password } = this.state;
        const response = await fetch('/student/signup', {
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
                Already have an account? Click <button className="stealth link" onClick={() => this.props.updateView('login')}>here</button> to log in.
            </div>
        )
    }
}

export default Guest;