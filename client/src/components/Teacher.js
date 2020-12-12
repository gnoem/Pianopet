import React, { useState, useEffect, useContext } from 'react';
import AppContext from '../AppContext';
import { prettifyDate } from '../utils';
import dayjs from 'dayjs';
import Loading from './Loading';
import Modal from './Modal';
import MiniMenu from './MiniMenu';
import { Dashboard, Sidebar, Topbar } from './Dashboard';

function Teacher(props) {
    const { teacher } = props;
    const [view, updateView] = useState({ type: 'home' });
    const [students, updateStudents] = useState([]);
    const [lastUpdatedData, updateLastUpdatedData] = useState(false);
    useEffect(() => {
        getStudents();
    }, []);
    useEffect(() => {
        let index = teacher.students.indexOf(lastUpdatedData.studentId);
        updateView(prevView => ({ ...prevView, data: students[index] }));
    }, [lastUpdatedData.studentId, lastUpdatedData.timestamp, teacher.students, students]);
    const getStudents = (studentId = false) => {
        const path = `/get/students/${teacher._id}`;
        fetch(path)
            .then(response => response.json())
            .then(result => {
                if (studentId) updateLastUpdatedData({ studentId, timestamp: Date.now() });
                updateStudents(result.students);
            });
    }
    const generateStudentList = () => {
        if (!students.length) return 'No students yet!';
        const studentList = [];
        for (let i = 0; i < students.length; i++) {
            studentList.push(
                <li key={students[i]._id}><button onClick={() => updateView({ type: 'student', data: students[i] })}>{students[i].firstName} {students[i].lastName}</button></li>
            );
        }
        return <ul>{studentList}</ul>;
    }
    return (
        <AppContext.Provider value={getStudents}>
            <Dashboard teacher={true}>
                <Sidebar>
                    <h2>Students</h2>
                    {generateStudentList()}
                    <div className="teacherCode">
                        Teacher code: <b>{props.teacher._id}</b>
                    </div>
                </Sidebar>
                <Topbar>
                    <button className="stealth link" onClick={() => updateView({ type: 'home' })}>Home</button>
                    <button className="stealth link" onClick={props.logout}>Log out</button>
                </Topbar>
                <Window view={view} />
            </Dashboard>
        </AppContext.Provider>
    )
}

function Window(props) {
    const { view } = props;
    switch (view.type) {
        case 'home': return <Home />;
        case 'student': return <ViewStudent data={view.data} />;
        default: return <Home />;
    }
}

function Home() {
    return (
        <div className="Window padme">
            <h1>Dashboard</h1>
            <ul>
                <li>View student dashboard</li>
                <ul>
                    <li>Add homework</li>
                    <li>Log assignment progress</li>
                    <li>Give coins</li>
                    <li>Award badges</li>
                </ul>
                <li>General - apply to all students</li>
                <ul>
                    <li>Add/edit/delete badges</li>
                    <li>Add/edit/delete closet items</li>
                </ul>
            </ul>
        </div>
    )
}

function ViewStudent(props) {
    const { data: student } = props;
    const [modal, updateModal] = useState(false);
    const [addedHomework, updateAddedHomework] = useState(false);
    const refreshData = useContext(AppContext);
    const closeForm = () => {
        updateModal(false);
        updateAddedHomework(Date.now());
    }
    return (
        <div className="Window">
            <div className="ViewStudent">
                <div className="viewStudentHeader">
                    <h1>{student.firstName}'s Homework Progress</h1>
                    <button className="stealth" onClick={() => updateModal(true)}><i className="fas fa-plus-circle"></i></button>
                    {modal &&
                        <Modal exit={() => updateModal(false)}>
                            <h2>{`Add homework for ${student.firstName}`}</h2>
                            <AddHomeworkForm studentId={student._id} closeForm={closeForm} />
                        </Modal>
                    }
                </div>
                <div className="viewStudentSidebar">
                    <img alt="student avatar" className="studentAvatar" src="https://lh3.googleusercontent.com/ImpxcbOUkhCIrWcHgHIDHmmvuFznNSGn2y1mor_hLqpYjI6Q1J7XAVvpR-I24ZOJL3s" />
                    <StudentCoins student={student} restoreToDefault={[student._id]} refreshData={refreshData} />
                    {/*<b>Badges:</b> {student.badges.length}<br /><br />/**/}
                </div>
                <div className="viewStudentHomework">
                    <ViewHomework refreshData={[addedHomework]} studentId={student._id} />
                </div>
            </div>
        </div>
    )
}

function StudentCoins(props) {
    const { student, restoreToDefault } = props;
    const [coinsCount, updateCoinsCount] = useState(student.coins);
    const [makingChanges, updateMakingChanges] = useState(false);
    useEffect(() => {
        updateMakingChanges(false);
    }, [restoreToDefault]);
    useEffect(() => {
        updateCoinsCount(student.coins);
    }, [student.coins]);
    const handleUpdateCoins = async (id) => {
        const response = await fetch('/update/coins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: student._id,
                coins: coinsCount
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success=true message from server');
        updateMakingChanges(false);
        props.refreshData(id);
    }
    const editCoinsButtons = () => {
        return (
            <div>
                <button className="stealth link" onClick={() => addCoins(-10)}><i className="fas fa-minus-circle"></i></button>
                <button className="stealth link" onClick={() => addCoins(10)}><i className="fas fa-plus-circle"></i></button>
            </div>
        )
    }
    const addCoins = (amount) => {
        updateCoinsCount(coinsCount + amount);
    }
    return (
        <div className="StudentCoins">
            <div className="coinsIcon"><img alt="coin icon" src="assets/Coin_ico.png" /></div>
            <span className="coinsCount">{coinsCount.toString()}</span>
            <div className="editCoinsButton">
                {makingChanges ? editCoinsButtons() : <button className="stealth link" onClick={() => updateMakingChanges(true)}>Edit</button>}
            </div>
            {makingChanges && <div className="confirmChangesButton">
                <button className="secondary" onClick={() => handleUpdateCoins(student._id)}>Save</button>
                <button className="secondary greyed" onClick={() => {
                    updateMakingChanges(false);
                    updateCoinsCount(student.coins);
                }}>Cancel</button>
            </div>}
        </div>
    )
}

function ViewHomework(props) {
    const { refreshData, studentId } = props;
    const [isLoaded, updateIsLoaded] = useState(false);
    const [homework, updateHomework] = useState([]);
    useEffect(() => {
        fetchData();
    }, [refreshData])
    useEffect(() => {
        updateIsLoaded(false);
        fetchData();
    }, [studentId]);
    async function fetchData() {
        const response = await fetch('/get/homework', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        updateHomework(body.homework);
        updateIsLoaded(true);
    }
    const viewHomework = () => {
        if (!isLoaded) return <Loading />
        if (!homework.length) return 'No homework exists for this student';
        const homeworkModules = [];
        for (let i = 0; i < homework.length; i++) {
            homeworkModules.push(<Homework key={homework[i]._id} {...homework[i]} />)
        }
        console.dir(homeworkModules);
        return homeworkModules;
    }
    return (
        <div className="ViewHomework">
            {viewHomework()}
        </div>
    )
}

function Homework(props) {
    const { studentId, date, headline, assignments } = props;
    const [showingMenu, updateShowingMenu] = useState(false);
    const [showingModal, updateShowingModal] = useState(false);
    const toggleMenu = () => {
        updateShowingMenu(prevState => !prevState);
    }
    const showMenu = () => {
        return (
            <MiniMenu exit={() => updateShowingMenu(false)}>
                <button className="stealth link edit" onClick={launchEditHomework}>Edit</button>
                <button className="stealth link delete">Delete</button>
            </MiniMenu>
        );
    }
    const launchEditHomework = () => {
        updateShowingMenu(false);
        updateShowingModal(true);
    }
    const showModal = () => {
        return (
            <Modal exit={() => updateShowingModal(false)}>
                <h2>Edit homework for {prettifyDate(date)}</h2>
                <EditHomeworkForm studentId={studentId} closeForm={() => updateShowingModal(false)} />
            </Modal>
        )
    }
    const homeworkAssignments = () => {
        const assignmentsList = [];
        for (let i = 0; i < assignments.length; i++) {
            assignmentsList.push(<li key={assignments[i]._id}>{assignments[i].label} – {assignments[i].progress.toString()}% completed</li>);
        }
        return assignmentsList;
    }
    return (
        <div className="Homework">
            <div className="Header">
                <div>
                    <span className="date">{prettifyDate(date)}</span>
                    <h3>{headline}</h3>
                </div>
                <div className="options">
                    <button className="stealth" onClick={toggleMenu}><i className="fas fa-bars"></i></button>
                    {showingMenu && showMenu()}
                    {showingModal && showModal()}
                </div>
            </div>
            <div className="Body">
                <ul>
                    {homeworkAssignments()}
                </ul>
            </div>
        </div>
    )
}

function AddHomeworkForm(props) {
    const [formData, updateFormData] = useState({
        studentId: props.studentId,
        date: dayjs().format('YYYY-MM-DD'),
        headline: 'Pls enter a headline',
        assignments: [{}, {}, {}, {}]
    });
    const handleAddHomework = async (e) => {
        e.preventDefault();
        const response = await fetch('/add/homework', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        // re dowjload data from server
        props.closeForm();
        console.log('successfully added homework!'); // */
    }
    const handleAddAssignment = (index, label) => {
        let { assignments } = formData;
        let item = assignments[index];
        item = { label: label, progress: 0 }
        assignments[index] = item;
        updateFormData({ ...formData, assignments }); // currently setting  all formdata  to assignments
    }
    const today = () => {
        return dayjs().format('YYYY-MM-DD');
    }
    return (
        <form className="addHomeworkForm" onSubmit={handleAddHomework} autoComplete="off">
            <div className="addHomework">
                <div className="addHomeworkDate">
                    <label htmlFor="date">Date:</label>
                    <input type="date" defaultValue={today()} onChange={(e) => updateFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="addHomeworkHeadline">
                    <label htmlFor="headline">Headline:</label>
                    <input type="text" onChange={(e) => updateFormData({ ...formData, headline: e.target.value })} />
                </div>
                <div className="addHomeworkAssignments">
                    <label htmlFor="assignments">Assignments:</label>
                    <li><span className="numBubble">1.</span><input type="text" onChange={(e) => handleAddAssignment(0, e.target.value)} /></li>
                    <li><span className="numBubble">2.</span><input type="text" onChange={(e) => handleAddAssignment(1, e.target.value)} /></li>
                    <li><span className="numBubble">3.</span><input type="text" onChange={(e) => handleAddAssignment(2, e.target.value)} /></li>
                    <li><span className="numBubble">4.</span><input type="text" onChange={(e) => handleAddAssignment(3, e.target.value)} /></li>
                </div>
            </div>
            <input type="Submit" />
        </form>
    )
}

function EditHomeworkForm(props) {
    const [formData, updateFormData] = useState({
        // existing homework object
    });
    const handleEditHomework = async (e) => {
        e.preventDefault();
        console.dir(formData);
    }
    return (
        <form className="editHomeworkForm" onSubmit={handleEditHomework} autoComplete="off">
            <div className="editHomework">
                editing homework...
            </div>
        </form>
    )
}

export default Teacher;