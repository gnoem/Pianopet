import './App.css';
import { useState, useEffect, useCallback } from 'react';
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
    const [categories, setCategories] = useState(false);
    const [badges, setBadges] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [modal, setModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const resize = useCallback(() => { // todo figure out if I am doing this right???
        if (!isMobile && window.innerWidth <= 900) return setIsMobile(true);
        if (isMobile && window.innerWidth > 900) return setIsMobile(false);
        // not debouncing since setIsMobile is called conditionally
    }, [isMobile]);
    useEffect(() => {
        getData();
        window.addEventListener('resize', resize);
        return () => window.addEventListener('resize', resize); // who knows if this is necessary for App.js but it can't hurt
    }, [resize]);
    const getData = async () => {
        const response = await fetch('/auth');
        const body = await response.json();
        if (!body.success) return setIsLoaded(true);
        const { student, teacher, wearables, categories, badges } = body;
        if (student) {
            setStudent(student);
            setTeacher(teacher);
            setWearables(wearables);
            setCategories(categories);
            setBadges(badges);
            setIsLoaded(true);
            return;
        }
        if (teacher) {
            setTeacher(teacher);
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
            children: content
        });
    }
    const state = {
        modal,
        isMobile,
        logout,
        updateModal: setModal,
        updateContextMenu
    }
    const studentProps = {
        student,
        teacher,
        wearables,
        categories,
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