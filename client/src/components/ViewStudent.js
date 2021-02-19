import { useState, useEffect, useRef } from 'react';
import Loading from './Loading';
import { prettifyDate } from '../utils';
import dayjs from 'dayjs';
import ContextMenu from './ContextMenu';

export default function ViewStudent(props) {
    const { student } = props;
    const [homework, setHomework] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const state = { homework }
    const getHomework = async () => {
        const response = await fetch(`/student/${student._id}/homework`);
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        setHomework(body.homework);
        setIsLoaded(true);
    }
    useEffect(() => {
        setIsLoaded(false);
        getHomework();
    }, [student._id]);
    const addNewHomework = () => {
        let content = (
            <div className="modalBox">
                <h2>{`Add homework for ${student.firstName}`}</h2>
                <AddHomeworkForm {...props} {...state} refreshHomework={getHomework} />
            </div>
        )
        props.updateModal(content);
    }
    if (!student) return;
    if (!isLoaded) return <Loading />;
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
                    <StudentCoins {...props} />
                </div>
                <div className="viewStudentHomework">
                    <ViewHomework {...props} {...state} refreshHomework={getHomework} />
                </div>
            </div>
        </div>
    )
}

function StudentCoins(props) {
    const { student } = props;
    const [coinsCount, updateCoinsCount] = useState(student.coins);
    const [makingChanges, updateMakingChanges] = useState(false);
    useEffect(() => {
        updateMakingChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student._id]);
    useEffect(() => {
        updateCoinsCount(student.coins);
    }, [student.coins]);
    const handleUpdateCoins = async () => {
        const response = await fetch(`/student/${student._id}/coins`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coins: coinsCount
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
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
    const { homework } = props;
    const viewHomework = () => {
        if (!homework.length) return 'No homework exists for this student';
        const homeworkModules = [];
        for (let i = 0; i < homework.length; i++) {
            homeworkModules.push(<Homework {...props} key={homework[i]._id} {...homework[i]} />)
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
    const { _id, date, headline, assignments } = props;
    const [showingMenu, updateShowingMenu] = useState(false);
    const toggleMenu = () => {
        updateShowingMenu(prevState => !prevState);
    }
    const showMenu = () => {
        return (
            <ContextMenu
              position={null}
              updateContextMenu={() => updateShowingMenu(false)}>
                <ul className="editDelete">
                    <li><button onClick={editHomework}>Edit</button></li>
                    <li><button onClick={confirmDeleteHomework}>Delete</button></li>
                </ul>
            </ContextMenu>
        );
    }
    const editHomework = () => {
        updateShowingMenu(false);
        props.updateModal(<EditHomeworkForm {...props} />);
    }
    const confirmDeleteHomework = () => {
        updateShowingMenu(false);
        let content = (options = {
            loadingIcon: false
        }) => (
            <div className="modalBox">
                <h2>Are you sure you want to proceed?</h2>
                This cannot be undone.
                {options.loadingIcon
                    ?   <Loading />
                    :   <div className="buttons">
                            <button onClick={handleDeleteHomework}>Yes, I'm sure</button>
                            <button className="greyed" onClick={() => props.updateModal(false)}>Cancel</button>
                        </div>
                    }
            </div>
        );
        props.updateModal(content);
    }
    const handleDeleteHomework = async () => {
        const response = await fetch(`/student/homework/${_id}`, { method: 'DELETE' });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        props.updateModal(false);
        props.refreshHomework();
    }
    const homeworkAssignments = () => {
        const assignmentsList = [];
        for (let i = 0; i < assignments.length; i++) {
            assignmentsList.push(<Assignment {...props} homeworkId={_id} key={assignments[i]._id} index={i} {...assignments[i]} />);
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
        const response = await fetch(`/student/homework/assignment/${homeworkId}/recorded`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                index,
                recorded
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        const updateCoins = async () => {
            let coinsCount = parseInt(coinsNumber.current.innerHTML);
            coinsCount += student.coins;
            const response = await fetch(`/student/${student._id}/coins`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    coins: coinsCount
                })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no { success: true } message from server');
            console.log('success!!!!!');
            props.refreshData();
            props.refreshHomework();
        }
        updateCoins();
    }
    const updateHomeworkProgress = async (index, value) => {
        const response = await fetch(`/student/homework/assignment/${homeworkId}/progress`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                index,
                value
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        props.refreshHomework();
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
    const { student } = props;
    const [formData, updateFormData] = useState({
        date: dayjs().format('YYYY-MM-DD'),
        headline: '',
        assignments: [{}, {}, {}, {}]
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`/student/${student._id}/homework`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        props.updateModal(false);
        props.refreshData();
        props.refreshHomework();
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
        <form className="addHomeworkForm" onSubmit={handleSubmit} autoComplete="off">
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
        const response = await fetch(`/student/homework/${_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        props.updateModal(false);
        props.refreshHomework();
    }
    const handleEditAssignment = (index, label) => {
        let item = assignments[index];
        item.label = label;
        assignments[index] = item;
        updateFormData({ ...formData, assignments });
    }
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