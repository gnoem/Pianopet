import './App.css';
import React, { Component } from 'react';
import Loading from './components/Loading';
import Guest from './components/Guest';
import Student from './components/Student';
import Teacher from './components/Teacher';

class App extends Component {
    constructor() {
        super();
        this.logout = this.logout.bind(this);
        this.getData = this.getData.bind(this);
        this.state = {
            isLoaded: false
        }
    }
    componentDidMount() {
        this.getData();
    }
    getData = async () => {
        const response = await fetch('/auth');
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return this.setState({ isLoaded: true, student: false, teacher: false });
        if (body.student) return this.setState({ isLoaded: true, student: body.student });
        if (body.teacher) return this.setState({ isLoaded: true, teacher: body.teacher });
    }
    logout = async () => {
        fetch('/logout').then(() => window.location.assign('/'));
    }
    render() {
        const { isLoaded, student, teacher } = this.state;
        const app = () => {
            if (!student && !teacher) return <Guest />;
            if (student) return <Student logout={this.logout} />;
            if (teacher) return <Teacher teacher={teacher} refreshTeacher={this.getData} logout={this.logout} />;
        }
        console.log('app loaded');
        return (
            <div className="App">
                {isLoaded ? app() : <Loading />}
            </div>
        )
    }
}

export default App;