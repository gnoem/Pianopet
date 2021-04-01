import "./Teacher.css";
import { useState, useEffect, useContext, useRef } from "react"
import { DataContext, ViewContext } from "../../contexts"
import { Account } from "../Account";
import { StudentDropdown } from "../Dropdown/index.js";
import { Header, Nav, Sidebar, ProfileDropdown } from "../Page";
import { TeacherBadges } from "../TeacherBadges";
import { TeacherMarketplace } from "../TeacherMarketplace";
import { ViewingStudent } from "../ViewingStudent";
import { StudentOverview } from "../StudentOverview";

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
    return (
        <>
            <Header {...{ view, updateView }}>
                <Nav>
                    <button className="stealth" onClick={() => updateView({ type: 'home' })}>Home</button>
                    <button className="stealth" onClick={() => updateView({ type: 'marketplace' })}>Marketplace</button>
                    <button className="stealth" onClick={() => updateView({ type: 'badges' })}>Badges</button>
                </Nav>
                <ProfileDropdown {...{ user: teacher, updateView }} />
            </Header>
            {(view.type === 'home') || <TeacherSidebar {...{ students, view, selectStudent }} />}
            <TeacherMain {...{ view, teacher, students, selectStudent }} />
        </>
    );
}

const TeacherSidebar = ({ students, view, selectStudent }) => {
    const onChange = (_id) => {
        const selectedStudent = students.find(student => student._id === _id);
        selectStudent(selectedStudent);
    }
    const defaultValue = (() => {
        if (view.type !== 'student' || !view.student) return null;
        return {
            value: view.student._id,
            display: `${view.student.firstName} ${view.student.lastName}`
        }
    })();
    const restoreDefault = view.type !== 'student';
    return (
        <Sidebar>
            <h2>Shortcuts</h2>
            {students.length && (
                <div>
                    <label>Select a student:</label>
                    <StudentDropdown
                        {...{ students, onChange, defaultValue, restoreDefault }}
                    />
                </div>
            )}
        </Sidebar>
    );
}

const TeacherMain = ({ view, teacher, students, selectStudent }) => {
    const content = () => {
        switch (view.type) {
            case 'home': return <Home {...{ teacher, students, selectStudent }} />;
            case 'student': return <ViewingStudent student={view.student} />;
            case 'marketplace': return <TeacherMarketplace />;
            case 'badges': return <TeacherBadges />;
            case 'my-account': return <Account />;
            default: return 'default';
        }
    }
    const twoColumns = view.type === 'student' ? ' twoColumns' : '';
    return (
        <div className={`Main${twoColumns}`}>
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