import './App.css';
import React, { Component } from 'react';
import { ReactComponent as LoadingIcon } from './components/Loading.svg';
import Guest from './components/Guest';
import Student from './components/Student';
import Teacher from './components/Teacher';

class App extends Component {
    constructor() {
        super();
        this.logout = this.logout.bind(this);
        this.state = {
            isLoaded: false
        }
    }
    componentDidMount() {
        this.authorize();
    }
    authorize = async () => {
        const response = await fetch('/auth');
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return this.setState({ isLoaded: true, student: false, teacher: false });
        console.log('retrieved info');
        if (body.student) return this.setState({ isLoaded: true, student: body.student });
        if (body.teacher) return this.setState({ isLoaded: true, teacher: body.teacher });
    }
    logout = async () => {
        fetch('/logout').then(() => window.location.assign('/'));
    }
    render() {
        const { isLoaded, student, teacher } = this.state;
        const app = () => {
            if (!student && !teacher) return <Guest />
            if (student) return <Student student={student} logout={this.logout} />
            if (teacher) return <Teacher teacher={teacher} logout={this.logout} />
        }
        return (
            <div className="App">
                {isLoaded ? app() : <Loading />}
            </div>
        )
    }
}

function Loading() {
    return (
        <div className="Loading">
            <LoadingIcon />
        </div>
    )
}

export default App;