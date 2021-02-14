import { useState, useEffect } from 'react';
import { Dashboard, Header, Sidebar, Nav } from './Dashboard';
import Loading from './Loading';
import ContextMenu from './ContextMenu';
import { prettifyDate } from '../utils';

export default function Student(props) {
    const [view, setView] = useState('home');
    const [student, setStudent] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [wearables, setWearables] = useState(null);
    const [badges, setBadges] = useState(null); 
    const [isLoaded, setIsLoaded] = useState(false);
    const getStudentData = async () => {
        const response = await fetch('/auth');
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        setStudent(body.student);
        setIsLoaded(true);
        // todo figure out where next three goes
        // only need to get this info once
        setTeacher(body.teacher);
        setWearables(body.wearables);
        setBadges(body.badges);
    }
    useEffect(() => {
        getStudentData();
    }, []);
    const state = {
        view,
        student,
        teacher,
        wearables,
        badges,
        updateView: setView,
        refreshData: getStudentData
    }
    if (!isLoaded) return <Dashboard><Loading /></Dashboard>;
    return (
        <Dashboard teacher={false}>
            <StudentProfileDropdown {...props} {...state} />
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
    );
}

function StudentProfileDropdown(props) {
    const { student } = props;
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded(prevState => !prevState);
    return (
        <Header className={expanded ? 'expanded' : ''}>
            <button onClick={toggleExpanded}>
                <span className="name">{student.firstName}</span>
                <span className="caret"></span>
            </button>
            <div className="pfp" onClick={toggleExpanded}>
                <img alt="pfp" src={student.profilePic ? student.profilePic : 'assets/defaultpfp.jpg' } />
            </div>
            <ContextMenu
              position={null}
              ignoreClick={['.User .pfp', '.User > button']}
              updateContextMenu={() => setExpanded(false)}
              content={(
                <ul>
                    <li><button className="myAccount" onClick={() => props.updateView({ type: 'account' })}>My Account</button></li>
                    <li><button className="settings" onClick={() => props.updateView({ type: 'settings' })}>Settings</button></li>
                    <li><button className="logout" onClick={props.logout}>Logout</button></li>
                </ul>
            )} />
        </Header>
    )
}

function Main(props) {
    const { view } = props;
    switch (view) {
        case 'home': return <Homework {...props} />;
        case 'marketplace': return <StudentMarketplace {...props} />;
        case 'badges': return <StudentBadges {...props} />;
        default: return <Homework {...props} />;
    }
}

function Homework(props) {
    const { student } = props;
    const [homework, setHomework] = useState(null);
    const getHomework = async () => {
        console.log('refreshing homework');
        const response = await fetch('/get/homework', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId: student._id })
        })
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        setHomework(body.homework);
    }
    useEffect(() => {
        getHomework();
    }, []);
    const generateHomeworkModules = () => homework.map(homework => <HomeworkModule {...props} {...homework} refreshHomework={getHomework} />);
    return (
        <div className="Main">
            <h1>My Homework Tracker</h1>
            <div className="ViewHomework">
                {homework ? generateHomeworkModules() : '...'}
            </div>
        </div>
    );
}

function HomeworkModule(props) {
    const { _id, date, headline, assignments } = props;
    const homeworkAssignments = () => assignments.map((info, index) => <Assignment {...props} index={index} {...info} _id={_id} />)
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
    );
}

function Assignment(props) {
    const { _id, index, label, progress, recorded } = props;
    const updateHomeworkProgress = async (value) => {
        // todo don't wait for server response to visually update UI!!!
        const response = await fetch('/update/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id, index, value })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        props.refreshHomework();
    }
    return (
        <li>
            <div className="label">{label}</div>
            <div className="progress">
                <button onClick={progress === 0 ? () => {} : () => updateHomeworkProgress(progress - 1)}
                    className={`stealth${progress === 0 ? ' disabled' : ''}`}
                    style={{ visibility: recorded ? 'hidden' : 'visible' }}><i className="fas fa-minus-circle"></i></button>
                <ProgressBar percentage={(100 * progress) / 4} />
                <button onClick={progress === 4 ? () => {} : () => updateHomeworkProgress(progress + 1)}
                    className={`stealth${progress === 4 ? ' disabled' : ''}`}
                    style={{ visibility: recorded ? 'hidden' : 'visible' }}><i className="fas fa-plus-circle"></i></button>
            </div>
        </li>
    )
}

function ProgressBar(props) {
    const { percentage } = props;
    return (
        <div className="ProgressBar">
            <div className="bar" style={{ width: percentage + '%' }}></div>
        </div>
    )
}

function StudentMarketplace(props) {
    return (
        <div className="Main">
            <div className="StudentMarketplace">
                <h1>Marketplace</h1>
            </div>
        </div>
    );
}

function StudentBadges(props) {
    return (
        <div className="Main">
            <div className="StudentBadges">
                <h1>My Badges</h1>
            </div>
        </div>
    );
}