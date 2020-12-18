import React, { useState, useEffect, useContext } from 'react';
import { prettifyDate } from '../utils';
import Loading from './Loading';
import { Dashboard, Sidebar, Topbar } from './Dashboard'

const StudentContext = React.createContext();
const HomeworkContext = React.createContext();

function Student(props) {
    const [view, updateView] = useState('home');
    const [student, updateStudent] = useState(null);
    const [isLoaded, updateIsLoaded] = useState(false);
    const fetchStudentData = () => {
        fetch('/auth')
            .then(response => response.json())
            .then(body => {
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no { success: true } response from server');
                updateStudent(body.student);
                updateIsLoaded(true);
            });
    }
    useEffect(() => {
        fetchStudentData();
    }, []);
    if (!isLoaded) return (
        <Dashboard>
            <Loading />
        </Dashboard>
    )
    return (
        <StudentContext.Provider value={fetchStudentData}>
            <Dashboard teacher={false}>
                <Sidebar>
                    <h1>{student.firstName}</h1>
                </Sidebar>
                <Topbar>
                    <button className="stealth link" onClick={() => updateView('home')}>Home</button>
                    <button className="stealth link" onClick={props.logout}>Log out</button>
                </Topbar>
                <Window view={view} student={student} />
            </Dashboard>
        </StudentContext.Provider>
    )
}

function Window(props) {
    const { view, student } = props;
    switch (view) {
        case 'home': return <Home student={student} />;
        default: return <Home student={student} />;
    }
}

function Home(props) {
    return (
        <div className="Window padme">
            <h1>Homework</h1>
            <ViewHomework student={props.student} />
        </div>
    )
}

function ViewHomework(props) {
    const { student } = props;
    const [homework, updateHomework] = useState(null);
    const fetchHomework = () => {
        fetch('/get/homework', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId: student._id })
        }).then(response => response.json())
            .then(body => {
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no { success: true } response from server');
                updateHomework(body.homework);
            });
    }
    useEffect(fetchHomework, []);
    const viewHomework = () => {
        const homeworkModules = [];
        for (let i = 0; i < homework.length; i++) {
            homeworkModules.push(<Homework {...homework[i]} />);
        }
        return homeworkModules;
    }
    return (
        <HomeworkContext.Provider value={fetchHomework}>
            <div className="ViewHomework">
                {homework ? viewHomework() : '...'}
            </div>
        </HomeworkContext.Provider>
    )
}

function Homework(props) {
    const { _id, date, headline, assignments } = props;
    const homeworkAssignments = () => {
        const assignmentsArray = [];
        for (let i = 0; i < assignments.length; i++) {
            assignmentsArray.push(<Assignment homeworkId={_id} index={i} {...assignments[i]} />);
        }
        return assignmentsArray;
    }
    return (
        <div className="Homework">
            <div className="Header">
                <div>
                    <span className="date">{prettifyDate(date)}</span>
                    <h3>{headline}</h3>
                </div>
            </div>
            <div className="Body">
                <ul>
                    <li className="smol">
                        <div className="label">Assignments</div>
                        <div className="progress">Progress</div>
                    </li>
                </ul>
                <ol>
                    {homeworkAssignments()}
                </ol>
            </div>
        </div>
    )
}

function Assignment(props) {
    const { homeworkId } = props;
    const fetchHomework = useContext(HomeworkContext);
    const updateHomeworkProgress = (index, value) => {
        fetch('/update/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: homeworkId, index, value })
        }).then(response => response.json())
            .then(body => {
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no { success: true } response from server');
                fetchHomework();
                // refresh hw data
            });
    }
    return (
        <li>
            <div className="label">{props.label}</div>
            <div className="progress">
                <input type="range"
                    min="0" max="4"
                    defaultValue={props.progress.toString()}
                    onChange={(e) => updateHomeworkProgress(props.index, e.target.value)}
                    disabled={props.recorded ? true : false} />
                {(props.progress > 0) &&
                    <div className={`coinsEarned${props.recorded ? ' coinsAdded' : ''}`}>
                        <img className="coinIcon" alt="coin icon" src="assets/Coin_ico.png" />
                        <span>{`${props.progress * 20}`}</span>
                    </div>}
            </div>
        </li>
    )
}

export default Student;