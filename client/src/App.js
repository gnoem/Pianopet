import './App.css';
import { useState, useEffect } from 'react';
import Loading from './components/Loading';
import Guest from './components/Guest';
import Student from './components/Student';
import Teacher from './components/Teacher';
import Modal from './components/Modal';
import ContextMenu from './components/ContextMenu';

export default function App() {
    const [student, setStudent] = useState(false);
    const [teacher, setTeacher] = useState(false);
    const [wearables, setWearables] = useState(false);
    const [badges, setBadges] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [modal, setModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(false);
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
            setTeacher(body.teacher);
            setWearables(body.wearables);
            setBadges(body.badges);
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
    const updateContextMenu = (e, content) => {
        const position = {
            top: `${e.clientY}px`,
            right: `${window.innerWidth - e.clientX}px`
        }
        setContextMenu({
            position,
            content
        });
    }
    const state = {
        modal,
        logout,
        updateModal: setModal,
        updateContextMenu
    }
    const studentProps = {
        student,
        teacher,
        wearables,
        badges
    }
    const app = () => {
        if (!student && !teacher) return <Guest />;
        if (student) return <Student {...state} {...studentProps} refreshData={getData} />;
        if (teacher) return <Teacher {...state} teacher={teacher} refreshTeacher={getData} />;
    }
    return (
        <div className="App">
            {modal && <Modal exit={() => setModal(false)} children={modal} />}
            {contextMenu && <ContextMenu {...contextMenu} updateContextMenu={setContextMenu} />}
            {isLoaded ? app() : <Loading />}
        </div>
    );
}