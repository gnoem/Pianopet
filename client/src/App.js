import './App.css';
import React, { Component } from 'react';
import Guest from './components/Guest';
import Dashboard from './components/Dashboard';

class App extends Component {
    constructor() {
        super();
        this.state = {
            student: false
        }
    }
    componentDidMount() {
        this.authorize();
    }
    authorize = async () => {
        const response = await fetch('/auth');
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.student) return console.log('no token');
        this.setState({
            student: body.student
        });
    }
    render() {
        const { student } = this.state;
        return (
            <div className="App">
                {student ? <Dashboard student={student} /> : <Guest />}
            </div>
        )
    }
}

export default App;