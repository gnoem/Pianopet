import React, { useState, useEffect, useContext } from 'react';
import AppContext from '../AppContext';
import { Dashboard, Sidebar, Topbar } from './Dashboard'

function Teacher(props) {
    const { teacher } = props;
    const [view, updateView] = useState({ type: 'home' });
    const [students, updateStudents] = useState([]);
    useEffect(() => {
        getStudents();
    }, []);
    const getStudents = () => {
        const path = `/get/students/${teacher._id}`;
        fetch(path)
            .then(response => response.json())
            .then(result => updateStudents(result.students))
            .catch(err => updateStudents([])); // needs to also update view?
    }
    const generateStudentList = () => {
        if (!students.length) return 'No students yet!';
        const studentList = [];
        for (let i = 0; i < students.length; i++) {
            studentList.push(
                <li><button onClick={() => updateView({ type: 'student', data: students[i] })}>{students[i].firstName} {students[i].lastName}</button></li>
            );
        }
        return <ul>{studentList}</ul>;
    }
    return (
        <AppContext.Provider value={getStudents}>
            <Dashboard teacher={true}>
                <div id="demo" onClick={() => console.dir(students)}></div>
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
        <div className="Window">
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
    const refreshData = useContext(AppContext);
    return (
        <div className="Window">
            <div className="ViewStudent">
                <div className="viewStudentHeader">
                    <h1>{student.firstName} {student.lastName}</h1>
                </div>
                <div className="viewStudentSidebar">
                    <img className="studentAvatar" src="https://lh3.googleusercontent.com/ImpxcbOUkhCIrWcHgHIDHmmvuFznNSGn2y1mor_hLqpYjI6Q1J7XAVvpR-I24ZOJL3s" />
                    <StudentCoins student={student} refreshData={refreshData} />
                    {/*<b>Badges:</b> {student.badges.length}<br /><br />/**/}
                </div>
                <div className="viewStudentHomework">
                    {/*<AddHomeworkForm firstName={student.firstName} studentId={student._id} />/**/}
                </div>
            </div>
        </div>
    )
}

function StudentCoins(props) {
    const { student } = props;
    console.dir('hi');
    console.dir(props);
    const [coinsCount, updateCoinsCount] = useState(student.coins);
    const [makingChanges, updateMakingChanges] = useState(false);
    const handleUpdateCoins = async () => {
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
        if (!body) return console.log('server error');
        if (!body.success) return console.log('no success=true message from server');
        updateMakingChanges(false);
        props.refreshData();
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
            <div className="coinsIcon"><img src="assets/Coin_ico.png" /></div>
            <span className="coinsCount">{coinsCount.toString()}</span>
            <div className="editCoinsButton">
                {makingChanges ? editCoinsButtons() : <button className="stealth link" onClick={() => updateMakingChanges(true)}>Edit</button>}
            </div>
            {makingChanges && <div className="confirmChangesButton">
                <button className="secondary" onClick={handleUpdateCoins}>Save</button>
                <button className="secondary greyed" onClick={() => {
                    updateMakingChanges(false);
                    updateCoinsCount(student.coins);
                }}>Cancel</button>
            </div>}
        </div>
    )
}

function AddHomeworkForm(props) {
    const [formData, updateFormData] = useState({
        studentId: props.studentId,
        date: Date.now(),
        headline: 'Pls enter a headline',
        assignments: [{}, {}, {}, {}]
    });
    const handleAddHomework = async (e) => {
        e.preventDefault();
        console.dir(formData);
        const response = await fetch('/add/homework', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('server error');
        if (!body.success) return console.log('no { success: true } response from server');
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
        return new Date().toISOString().split('T')[0];
    }
    return (
        <form onSubmit={handleAddHomework} autoComplete="off">
            <h2>Add homework for {props.firstName}</h2>
            <label for="date">Date:</label>
            <input type="date" defaultValue={today()} onChange={(e) => updateFormData({ ...formData, date: e.target.value })} />
            <label for="headline">Headline:</label>
            <input type="text" onChange={(e) => updateFormData({ ...formData, headline: e.target.value })} />
            <label for="assignments">Assignments:</label>
            <li>1. <input type="text" onChange={(e) => handleAddAssignment(0, e.target.value)} /></li>
            <li>2. <input type="text" onChange={(e) => handleAddAssignment(1, e.target.value)} /></li>
            <li>3. <input type="text" onChange={(e) => handleAddAssignment(2, e.target.value)} /></li>
            <li>4. <input type="text" onChange={(e) => handleAddAssignment(3, e.target.value)} /></li>
            <input type="Submit" />
        </form>
    )
}

export default Teacher;