import { useState, useEffect, useRef, useCallback } from 'react';
import Loading from './Loading';
import Avatar from './Avatar';
import { prettifyDate } from '../utils';
import dayjs from 'dayjs';
import ContextMenu from './ContextMenu';

export default function ViewStudent(props) {
    const { student, wearables, categories } = props;
    const [homework, setHomework] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const state = { homework }
    const getHomework = useCallback(async () => {
        const response = await fetch(`/student/${student._id}/homework`);
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no { success: true } response from server');
        setHomework(body.homework);
        setIsLoaded(true);
    }, [student._id]);
    useEffect(() => {
        setIsLoaded(false);
        getHomework();
        // the following function converts student.avatar, which is an array of string IDs, to an object with category names as keys
        const createAvatarObject = (avatarArray) => avatarArray.reduce((obj, id) => {
            const index = wearables.findIndex(element => element._id === id);
            const { category, _id, name, src, image } = wearables[index];
            const categoryName = categories.find(item => item._id === category)?.name;
            obj[categoryName] = { _id, name, src, image };
            return obj;
        }, {});
        setAvatar(createAvatarObject(student.avatar));
    // wearables and student.avatar won't change during the lifetime of this component
    // so should I omit them or include them? todo figure it out
    // eslint-disable-next-line
    }, [student._id, getHomework]);
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
                <div className="viewStudentMain">
                    <div className="viewStudentHeader">
                        <h1>{student.firstName}'s Homework Progress</h1>
                        <button className="stealth" onClick={addNewHomework}><i className="fas fa-plus-circle"></i></button>
                    </div>
                    <ViewHomework {...props} {...state} refreshHomework={getHomework} />
                </div>
                <div className="viewStudentSidebar">
                    <div className="avatarContainer">
                        <Avatar {...props} avatar={avatar} viewingAsTeacher={true} />
                    </div>
                    <StudentCoins {...props} />
                    <div className="StudentStats">
                        <img className="statsIcon" alt="badge icon" src="assets/Badge_ico.svg" />
                        <span className="statsLabel">{student.badges.length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StudentCoins(props) {
    const { student } = props;
    const [coinsCount, setCoinsCount] = useState(student.coins);
    const [makingChanges, setMakingChanges] = useState(false);
    useEffect(() => {
        setMakingChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student._id]);
    useEffect(() => {
        setCoinsCount(student.coins);
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
        console.dir(body);
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success=true message from server');
        setMakingChanges(false);
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
        setCoinsCount(coinsCount + amount);
    }
    const formatCoins = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (
        <div className="StudentStats">
            <img className="statsIcon" alt="coin icon" src="assets/Coin_ico.png" />
            <span className="statsLabel">{formatCoins(coinsCount)}</span>
            <div className="editCoinsButton">
                {makingChanges ? editCoinsButtons() : <button className="stealth link" onClick={() => setMakingChanges(true)}>Edit</button>}
            </div>
            {makingChanges && <div className="confirmChangesButton">
                <button className="secondary" onClick={() => handleUpdateCoins(student._id)}>Save</button>
                <button className="secondary greyed" onClick={() => {
                    setMakingChanges(false);
                    setCoinsCount(student.coins);
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
            <div className="homeworkHeader">
                <div>
                    <span className="date">{prettifyDate(date)}</span>
                    <h3>{headline}</h3>
                </div>
                <div className="options">
                    <button className="stealth" onClick={toggleMenu}><i className="fas fa-bars"></i></button>
                    {showingMenu && showMenu()}
                </div>
            </div>
            <div className="homeworkBody">
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
        const response = await fetch(`/assignment/${homeworkId}/recorded`, {
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
        const response = await fetch(`/assignment/${homeworkId}/progress`, {
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

function AddHomeworkForm(props) { // todo better
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