import "./Teacher.css";
import { useState, useEffect, useContext, useRef } from "react";
import { DataContext, ViewContext } from "../../contexts";
import { Account } from "../Account";
import { Header, Nav, ProfileDropdown } from "../Page";
import { StudentOverview } from "./StudentOverview";
import { TeacherBadges } from "./TeacherBadges";
import { TeacherMarketplace } from "./TeacherMarketplace";
import { TeacherSettings } from "./TeacherSettings";
import { ViewingStudent } from "./ViewingStudent";

export const Teacher = () => {
    const { teacher, students } = useContext(DataContext);
    const { view, updateView, updateCurrentStudent } = useContext(ViewContext);
    const selectStudent = (student) => updateView({ type: 'student', student });
    useEffect(() => {
        if (view.type !== 'student') return;
        const refreshCurrentStudent = () => {
            const currentStudent = view.student;
            const updatedStudent = students.find(student => student._id === currentStudent._id);
            updateCurrentStudent(updatedStudent);
        }
        refreshCurrentStudent();
    }, [students]);
    return <>
        <Header {...{ view, updateView }}>
            <Nav>
                <button className="stealth" onClick={() => updateView({ type: 'home' })}>Home</button>
                <button className="stealth" onClick={() => updateView({ type: 'marketplace' })}>Marketplace</button>
                <button className="stealth" onClick={() => updateView({ type: 'badges' })}>Badges</button>
            </Nav>
            <ProfileDropdown {...{ user: teacher, updateView }} />
        </Header>
        <TeacherMain {...{ view, teacher, students, selectStudent }} />
    </>;
}

const TeacherMain = ({ view, teacher, students, selectStudent }) => {
    const content = () => {
        switch (view.type) {
            case 'home': return <Home {...{ teacher, students, selectStudent }} />;
            case 'student': return (
                <ViewingStudent
                    student={view.student}
                    {...{ students, view, selectStudent }} />
            );
            case 'marketplace': return <TeacherMarketplace />;
            case 'badges': return <TeacherBadges />;
            case 'my-account': return <Account />;
            case 'settings': return <TeacherSettings />;
            default: return 'default';
        }
    }
    const isGrid = view.type === 'student' ? ' isGrid' : '';
    return (
        <div className={`Main${isGrid}`}>
            {content()}
        </div>
    );
}

const Home = ({ teacher, students, selectStudent }) => {
    return (
        <div className="Home">
            <h1>Dashboard</h1>
            <h2>Student overview</h2>
            <StudentOverview {...{ students, selectStudent }} />
            <hr />
            <h2>Invite new students</h2>
            <TeacherCodeLink {...{ teacher }} />
        </div>
    );
}

const TeacherCodeLink = ({ teacher }) => {
    const [copied, setCopied] = useState(false);
    const teacherCodeBox = useRef(null);
    const copiedNotif = useRef(null);
    useEffect(() => {
        if (!copied) return;
        setTimeout(() => {
            if (!copiedNotif.current) return;
            copiedNotif.current.classList.add('bye');
            setTimeout(() => setCopied(false), 300);
        }, 3000);
    }, [copied, copiedNotif.current]);
    const copyToClipboard = () => {
        teacherCodeBox.current.select();
        document.execCommand('copy');
        setCopied(true);
    }
    const link = `${window.location.origin}/signup/?t=${teacher._id}`;
    return (
        <>
            <label>Click to copy invite link:</label>
            <div className="TeacherCode" onClick={copyToClipboard}>
                <textarea ref={teacherCodeBox} value={link} readOnly />
                {copied && <span className="copied" ref={copiedNotif}>Copied</span>}
            </div>
        </>
    );
}