import { useContext } from "react"
import { DataContext, ViewContext } from "../../contexts"
import { Account } from "../Account";
import { Dropdown } from "../Dropdown/index.js";
import { Header, Nav, Sidebar, ProfileDropdown } from "../Page";
import { TeacherBadges } from "../TeacherBadges";
import { TeacherMarketplace } from "../TeacherMarketplace";
import { ViewingStudent } from "../ViewingStudent";

export const Teacher = () => {
    const { teacher, students, categories } = useContext(DataContext);
    const { view, updateView } = useContext(ViewContext);
    return (
        <>
            <Header {...{ view, updateView }}>
                <Nav>
                    <button className="stealth" onClick={() => updateView({ type: 'home' })}>Home</button>
                    <button className="stealth" onClick={() => updateView({ type: 'marketplace' })}>Marketplace</button>
                    <button className="stealth" onClick={() => updateView({ type: 'badges' })}>Badges</button>
                    <button className="stealth" onClick={() => updateView({ type: 'my-account' })}>Account</button>
                </Nav>
                <ProfileDropdown {...{ user: teacher, updateView }} />
            </Header>
            <TeacherSidebar {...{ students, view, updateView }} />
            <TeacherMain {...{ view, categories }} />
        </>
    );
}

const TeacherSidebar = ({ students, view, updateView }) => {
    const handleSelection = (student) => updateView({ type: 'student', student });
    const studentList = (() => {
        return students.map(student => ({
            value: student,
            display: `${student.firstName} ${student.lastName}`
        }));
    })();
    return (
        <Sidebar>
            <label>Select a student:</label>
            <Dropdown
                style={{ minWidth: '14rem' }}
                onChange={handleSelection}
                listItems={studentList}
                restoreDefault={view.type !== 'student'}
            />
        </Sidebar>
    );
}

const TeacherMain = ({ view, categories }) => {
    const content = () => {
        switch (view.type) {
            case 'home': return 'home';
            case 'student': return <ViewingStudent student={view.student} />;
            case 'marketplace': return <TeacherMarketplace {...{ categories }} />;
            case 'badges': return <TeacherBadges />;
            case 'my-account': return <Account />;
            default: return 'default';
        }
    }
    return (
        <div className="Main">
            {content()}
        </div>
    );
}