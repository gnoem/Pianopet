import './App.css';
import React, { Component } from 'react';
import Guest from './components/Guest';
import Dashboard from './components/Dashboard';

class App extends Component {
    constructor() {
        super();
        this.state = {
            isLoggedIn: false
        }
    }
    render() {
        const { isLoggedIn } = this.state;
        return (
            <div className="App">
                {isLoggedIn ? <Dashboard /> : <Guest />}
            </div>
        )
    }
}

export default App;