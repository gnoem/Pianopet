import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import AppContext from '../AppContext';
import { prettifyDate } from '../utils';
import dayjs from 'dayjs';
import Loading from './Loading';
import Modal from './Modal';
import MiniMenu from './MiniMenu';
import { Dashboard, Header, Sidebar } from './Dashboard';

function Teacher(props) {
    const { teacher } = props;
    const [view, setView] = useState({ type: 'home' });
    const [students, setStudents] = useState([]);
    const [lastUpdatedData, setLastUpdatedData] = useState(false);
    const [modal, setModal] = useState(false);
    const getStudents = (studentId = false) => {
        const path = `/get/students/${teacher._id}`;
        fetch(path)
            .then(response => response.json())
            .then(result => {
                if (studentId) setLastUpdatedData({ studentId, timestamp: Date.now() });
                setStudents(result.students);
            });
    }
    useEffect(getStudents, [teacher._id]);
    useEffect(() => {
        let index = teacher.students.indexOf(lastUpdatedData.studentId);
        setView(prevView => ({ ...prevView, data: students[index] }));
    }, [lastUpdatedData.studentId, lastUpdatedData.timestamp, teacher.students, students]);
    const generateStudentList = () => {
        if (!students.length) return 'No students yet!';
        const studentList = [];
        for (let i = 0; i < students.length; i++) {
            studentList.push(
                <li key={students[i]._id}><button className="stealth link" onClick={() => setView({ type: 'student', data: students[i] })}>{students[i].firstName} {students[i].lastName}</button></li>
            );
        }
        return <ul className="stealth">{studentList}</ul>;
    }
    return (
        <AppContext.Provider value={getStudents}>
            {modal && <Modal exit={() => setModal(false)} children={modal} />}
            <Dashboard teacher={true}>
                <Header>
                    {teacher.username}
                </Header>
                <Sidebar>
                    <h2>Students</h2>
                    {generateStudentList()}
                    <hr />
                    <h2>Control Panel</h2>
                    <ul className="stealth">
                        <li><button onClick={() => setView({ type: 'marketplace' })} className="stealth link">Marketplace</button></li>
                        <li><button onClick={() => setView({ type: 'badges' })} className="stealth link">Badges</button></li>
                    </ul>
                    <hr />
                    <div className="teacherCode">
                        Teacher code:<br />
                        <b style={{ fontSize: '0.8rem' }}>{teacher._id}</b>
                    </div>
                </Sidebar>
                <Main view={view} modal={modal} updateModal={setModal} />
            </Dashboard>
        </AppContext.Provider>
    )
}

function Main(props) {
    const { view } = props;
    switch (view.type) {
        case 'home': return <Home {...props} />;
        case 'student': return <ViewStudent {...props} data={view.data} />;
        case 'marketplace': return <TeacherMarketplace {...props} />;
        case 'badges': return <TeacherBadges {...props} />;
        default: return <Home {...props} />;
    }
}

function Home() {
    return (
        <div className="Main padme">
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
    const [addedHomework, setAddedHomework] = useState(false);
    const refetchStudentData = useContext(AppContext); // when this is called, getStudents() function in Teacher() refetches student data and updates props
    const refetchHomeworkData = () => {
        props.updateModal(false);
        setAddedHomework(Date.now());
    }
    const addNewHomework = () => {
        let content = (
            <div className="modalBox">
                <h2>{`Add homework for ${student.firstName}`}</h2>
                <AddHomeworkForm studentId={student._id} refetchHomeworkData={refetchHomeworkData} />
            </div>
        )
        props.updateModal(content);
    }
    if (!student) return;
    return (
        <div className="Main">
            <div className="ViewStudent">
                <div className="viewStudentHeader">
                    <h1>{student.firstName}'s Homework Progress</h1>
                    <button className="stealth" onClick={addNewHomework}><i className="fas fa-plus-circle"></i></button>
                </div>
                <div className="viewStudentSidebar">
                    <div className="avatarContainer">
                        <img alt="student avatar" className="studentAvatar" src="https://lh3.googleusercontent.com/ImpxcbOUkhCIrWcHgHIDHmmvuFznNSGn2y1mor_hLqpYjI6Q1J7XAVvpR-I24ZOJL3s" />
                    </div>
                    <StudentCoins student={student} restoreToDefault={[student._id]} refetchStudentData={refetchStudentData} />
                </div>
                <div className="viewStudentHomework">
                    <ViewHomework {...props} refetchDataOnChange={[addedHomework]} refetchStudentData={refetchStudentData} refetchHomeworkData={refetchHomeworkData} student={student} />
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, restoreToDefault);
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
        props.refetchStudentData(id);
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
    const { refetchDataOnChange, student } = props;
    const [isLoaded, updateIsLoaded] = useState(false);
    const [homework, updateHomework] = useState([]);
    const fetchData = useCallback(async () => {
        const response = await fetch('/get/homework', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId: student._id })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        return body.homework;
    }, [student._id]);
    useEffect(() => {
        fetchData().then(homework => {
            updateHomework(homework);
            updateIsLoaded(true);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, refetchDataOnChange);
    useEffect(() => {
        updateIsLoaded(false);
        fetchData().then(homework => {
            updateHomework(homework);
            updateIsLoaded(true);
        });
    }, [fetchData, student._id]);
    const viewHomework = () => {
        if (!isLoaded) return <Loading />
        if (!homework.length) return 'No homework exists for this student';
        const homeworkModules = [];
        for (let i = 0; i < homework.length; i++) {
            homeworkModules.push(<Homework {...props} key={homework[i]._id} student={student} {...homework[i]} refetchStudentData={props.refetchStudentData} refetchHomeworkData={props.refetchHomeworkData} />)
        }
        return homeworkModules;
    }
    return (
        <div className="ViewHomework">
            {viewHomework()}
        </div>
    )
}

function Homework(props) {
    const { student, _id, date, headline, assignments } = props;
    const [showingMenu, updateShowingMenu] = useState(false);
    const toggleMenu = () => {
        updateShowingMenu(prevState => !prevState);
    }
    const showMenu = () => {
        return (
            <MiniMenu exit={() => updateShowingMenu(false)}>
                <button className="stealth link edit" onClick={launchEditHomework}>Edit</button>
                <button className="stealth link delete" onClick={confirmDeletion}>Delete</button>
            </MiniMenu>
        );
    }
    const launchEditHomework = () => {
        updateShowingMenu(false);
        props.updateModal(<EditHomeworkForm {...props} />);
    }
    const confirmDeletion = () => {
        updateShowingMenu(false);
        let content = (
            <div className="modalBox">
                <h2>Are you sure you want to proceed?</h2>
                This cannot be undone.
                <div className="buttons">
                    <button onClick={handleDeleteHomework}>Yes, I'm sure</button>
                    <button className="greyed" onClick={() => props.updateModal(false)}>Cancel</button>
                </div>
            </div>
        );
        props.updateModal(content);
    }
    const handleDeleteHomework = async () => {
        const response = await fetch('/delete/homework', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        props.updateModal(false);
        props.refetchHomeworkData();
    }
    const homeworkAssignments = () => {
        const assignmentsList = [];
        for (let i = 0; i < assignments.length; i++) {
            assignmentsList.push(<Assignment student={student} homeworkId={_id} refetchStudentData={props.refetchStudentData} refetchHomeworkData={props.refetchHomeworkData} key={assignments[i]._id} index={i} {...assignments[i]} />);
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
    const { student, homeworkId } = props;
    const coinsNumber = useRef(null);
    const addCoins = async (index, recorded = true) => {
        if (props.recorded) return;
        const response = await fetch('/update/recorded', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: homeworkId, index, recorded })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        const updateCoins = async () => {
            let coinsCount = parseInt(coinsNumber.current.innerHTML);
            coinsCount += student.coins;
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
            if (!body.success) return console.log('no { success: true } message from server');
            console.log('success!!!!!');
            props.refetchStudentData(student._id);
            props.refetchHomeworkData();
        }
        updateCoins();
    }
    const updateHomeworkProgress = async (index, value) => {
        const response = await fetch('/update/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: homeworkId, index, value })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        props.refetchHomeworkData();
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
                    <div className={`coinsEarned${props.recorded ? ' coinsAdded' : ''}`} onClick={() => addCoins(props.index)}>
                        <img className="coinIcon" alt="coin icon" src="assets/Coin_ico.png" />
                        <span ref={coinsNumber}>{`${props.progress * 20}`}</span>
                    </div>}
            </div>
        </li>
    )
}

function AddHomeworkForm(props) {
    const [formData, updateFormData] = useState({
        studentId: props.studentId,
        date: dayjs().format('YYYY-MM-DD'),
        headline: '',
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
        props.refetchHomeworkData();
        console.log('successfully added homework!'); // */
    }
    const handleAddAssignment = (index, label) => {
        let { assignments } = formData;
        let item = assignments[index];
        item = { label: label, progress: 0 }
        assignments[index] = item;
        updateFormData({ ...formData, assignments });
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
    const { _id, date, headline, assignments } = props;
    const [formData, updateFormData] = useState({ _id, date, headline, assignments });
    const handleEditHomework = async (e) => {
        e.preventDefault();
        const response = await fetch('/edit/homework', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        props.closeModal();
        props.refetchHomeworkData();
    }
    const handleEditAssignment = (index, label) => {
        let item = assignments[index];
        item.label = label;
        assignments[index] = item;
        updateFormData({ ...formData, assignments });
    }
    console.log(date);
    return (
        <form className="addHomeworkForm" onSubmit={handleEditHomework} autoComplete="off">
            <h2>Edit homework for {prettifyDate(date)}</h2>
            <div className="addHomework">
                <div className="addHomeworkDate">
                    <label htmlFor="date">Date:</label>
                    <input type="date" defaultValue={date.split('T')[0]} onChange={(e) => updateFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="addHomeworkHeadline">
                    <label htmlFor="headline">Headline:</label>
                    <input type="text" defaultValue={headline} onChange={(e) => updateFormData({ ...formData, headline: e.target.value })} />
                </div>
                <div className="addHomeworkAssignments">
                    <label htmlFor="assignments">Assignments:</label>
                    <li><span className="numBubble">1.</span><input type="text" defaultValue={assignments[0].label} onChange={(e) => handleEditAssignment(0, e.target.value)} /></li>
                    <li><span className="numBubble">2.</span><input type="text" defaultValue={assignments[1].label} onChange={(e) => handleEditAssignment(1, e.target.value)} /></li>
                    <li><span className="numBubble">3.</span><input type="text" defaultValue={assignments[2].label} onChange={(e) => handleEditAssignment(2, e.target.value)} /></li>
                    <li><span className="numBubble">4.</span><input type="text" defaultValue={assignments[3].label} onChange={(e) => handleEditAssignment(3, e.target.value)} /></li>
                </div>
            </div>
            <input type="Submit" />
        </form>
    )
}

function TeacherMarketplace(props) {
    const addNewWearable = () => {
        props.updateModal(<AddNewWearable {...props} />)
    }
    return (
        <div className="Main">
            marketplace!
            <div className="marketplace">
                marketplace component: view = category;<br />
                generate list of clothing items based on view<br />
                clothing item onclick = preview
            </div>
            <ul>
                <li>add new wearables</li>
                <li>edit/delete existing wearables</li>
            </ul>
            <button onClick={addNewWearable}>Add new wearable</button>
        </div>
    )
}

function AddNewWearable(props) {
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'head',
        src: '',
        value: ''
    });
    const updateFormData = (key, value) => {
        setFormData(prevState => ({
            ...prevState,
            [key]: value
        }));
    }
    const handleAddWearable = async (e) => {
        e.preventDefault();
        setLoadingIcon(true);
        console.table(formData);
        const response = await fetch('/add/wearable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        console.table(formData);
        props.updateModal(false); // */
    }
    return (
        <div className="modalBox">
            <form className="pad" onSubmit={handleAddWearable}>
                <h2>Add new wearable</h2>
                <label htmlFor="name">Wearable name:</label>
                <input type="text" onChange={(e) => updateFormData('name', e.target.value)} />
                <label htmlFor="value">Category:</label>
                <select style={{ marginBottom: '1rem', padding: '0.5rem' }} onChange={(e) => updateFormData('category', e.target.value)} value={formData.category}>
                    <option value="head">Head</option>
                    <option value="face">Face</option>
                    <option value="body">Body</option>
                </select>
                <label htmlFor="src">Image link:</label>
                <input type="text" onChange={(e) => updateFormData('src', e.target.value)} />
                <label htmlFor="value">Wearable value:</label>
                <input type="text" onChange={(e) => updateFormData('value', e.target.value)} />
                <div className="buttons">
                    {loadingIcon
                        ? <Loading />
                        : <input type="submit" />
                    }
                </div>
            </form>
        </div>
    )
}

function TeacherBadges() {
    return (
        <div className="Main">
            badges!
            <ul>
                <li>add new badges</li>
                <li>edit/delete badges</li>
            </ul>
        </div>
    )
}

export default Teacher;