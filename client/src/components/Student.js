import React, { useState, useEffect, useContext } from 'react';
import { prettifyDate } from '../utils';
import Loading from './Loading';
import { Dashboard, Header, Sidebar, Nav } from './Dashboard'

const StudentContext = React.createContext();
const HomeworkContext = React.createContext();

function Student(props) {
    const [view, setView] = useState('home');
    const [student, setStudent] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const fetchStudentData = () => {
        fetch('/auth')
            .then(response => response.json())
            .then(body => {
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no { success: true } response from server');
                setStudent(body.student);
                setIsLoaded(true);
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
                <Header>
                    {student.firstName}
                </Header>
                <Sidebar>
                    <div className="StudentSidebar">
                        <div className="avatarContainer">
                            <img alt="student avatar" className="studentAvatar" src="https://lh3.googleusercontent.com/ImpxcbOUkhCIrWcHgHIDHmmvuFznNSGn2y1mor_hLqpYjI6Q1J7XAVvpR-I24ZOJL3s" />
                        </div>
                        <div className="studentCoins">
                            <div className="coinsIcon"><img alt="coin icon" src="assets/Coin_ico.png" /></div>
                            <span className="coinsCount">{student.coins.toString()}</span>
                        </div>
                    </div>
                </Sidebar>
                <Main view={view} student={student} />
                <Nav>
                    <button className="stealth link" onClick={() => setView('home')}>Homework</button>
                    <button className="stealth link" onClick={() => setView('marketplace')}>Marketplace</button>
                    <button className="stealth link" onClick={() => setView('badges')}>Badges</button>
                    <button className="stealth link" onClick={props.logout}>Log out</button>
                </Nav>
            </Dashboard>
        </StudentContext.Provider>
    )
}

function Main(props) {
    const { view, student } = props;
    switch (view) {
        case 'home': return <Home student={student} />;
        default: return <Home student={student} />;
    }
}

function Home(props) {
    return (
        <div className="Main">
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
    const updateHomeworkProgress = (value) => {
        fetch('/update/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: homeworkId, index: props.index, value })
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
                <button onClick={props.progress === 0 ? () => {} : () => updateHomeworkProgress(props.progress - 1)}
                    className={`stealth${props.progress === 0 ? ' disabled' : ''}`}
                    style={{ visibility: props.recorded ? 'hidden' : 'visible' }}><i className="fas fa-minus-circle"></i></button>
                <ProgressBar percentage={(100 * props.progress) / 4} />
                <button onClick={props.progress === 4 ? () => {} : () => updateHomeworkProgress(props.progress + 1)}
                    className={`stealth${props.progress === 4 ? ' disabled' : ''}`}
                    style={{ visibility: props.recorded ? 'hidden' : 'visible' }}><i className="fas fa-plus-circle"></i></button>
                {/*(props.progress > 0) &&
                    <div className={`coinsEarned${props.recorded ? ' coinsAdded' : ''}`}>
                        <img className="coinIcon" alt="coin icon" src="assets/Coin_ico.png" />
                        <span>{`${props.progress * 20}`}</span>
                    </div>*/}
            </div>
        </li>
    )
}

function ProgressBar(props) {
    return (
        <div className="ProgressBar">
            <div className="bar" style={{ width: props.percentage+'%' }}></div>
        </div>
    )
}

export default Student;