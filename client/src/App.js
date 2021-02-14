import './App.css';
import { useState, useEffect } from 'react';
import Loading from './components/Loading';
import Guest from './components/Guest';
import Student from './components/Student';
import Teacher from './components/Teacher';

export default function App() {
    const [student, setStudent] = useState(false);
    const [teacher, setTeacher] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        getData();
    }, []);
    const getData = async () => {
        const response = await fetch('/auth');
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return setIsLoaded(true);
        if (body.student) {
            setStudent(body.student);
            setIsLoaded(true);
            return;
        }
        if (body.teacher) {
            setTeacher(body.teacher);
            setIsLoaded(true);
            return;
        }
    }
    const logout = async () => {
        fetch('/logout').then(() => window.location.assign('/'));
    }
    const app = () => {
        if (!student && !teacher) return <Guest />;
        if (student) return <Student logout={logout} />;
        if (teacher) return <Teacher teacher={teacher} refreshTeacher={getData} logout={logout} />;
    }
    return (
        <div className="App">
            {isLoaded ? app() : <Loading />}
        </div>
    )
}