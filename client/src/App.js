import './App.css';
import { useState, useEffect, useCallback } from 'react';
import Loading from './components/Loading';
import Guest from './components/Guest';
import Student from './components/Student';
import Teacher from './components/Teacher';
import Modal from './components/Modal';
import ContextMenu from './components/ContextMenu';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';

export default function App() {
    const [user, setUser] = useState({
        teacher: false,
        student: false
    });
    const [userData, setUserData] = useState({});
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
        const { studentData, teacherData } = body;
        if (studentData) {
            setUser({ student: true });
            setUserData(studentData);
            setIsLoaded(true);
            return studentData;
        }
        if (teacherData) {
            setUser({ teacher: true });
            setUserData(teacherData);
            setIsLoaded(true);
            return teacherData;
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
    const updateModal = (modalContent, set = setModal, customProps = {}) => {
        if (modalContent) return set({ content: modalContent, customProps });
        const box = document.querySelector('.Modal');
        if (!box) return set(false);
        box.classList.remove('active');
        setTimeout(() => set(false), 200);
    }
    const state = {
        modal,
        isMobile,
        ...userData,
        logout,
        updateModal,
        updateContextMenu,
        gracefullyCloseModal: (fn) => updateModal(false, fn)
    }
    const app = () => {
        if (!user.student && !user.teacher) return <Guest />;
        if (user.student) return <Student {...state} refreshData={getData} />;
        if (user.teacher) return <Teacher {...state} refreshData={getData} />;
    }
    return (
        <Router>
            <Switch>
                <Route path="/signup">
                    <Guest signup={true} />
                </Route>
                <Route path="/">
                    <div className="App">
                        {modal && <Modal exit={() => updateModal(false)} children={modal?.content} {...modal?.customProps} />}
                        {contextMenu && <ContextMenu {...contextMenu} updateContextMenu={setContextMenu} />}
                        {isLoaded ? app() : <Loading />}
                    </div>
                </Route>
            </Switch>
        </Router>
    );
}