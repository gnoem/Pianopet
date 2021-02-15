import { useState, useEffect } from 'react';
import { Dashboard, Header, Sidebar, Nav } from './Dashboard';
import Closet from './Closet';
import Avatar from './Avatar';
import Marketplace from './Marketplace';
import ContextMenu from './ContextMenu';
import { prettifyDate } from '../utils';
import Button from './Button';

export default function Student(props) {
    const { student, wearables } = props;
    const [view, setView] = useState('home');
    const [avatar, setAvatar] = useState(null);
    useEffect(() => {
        // the following function converts student.avatar, which is an array of string IDs, to an object with category names as keys
        const createAvatarObject = (avatarArray) => avatarArray.reduce((obj, id) => {
            const index = wearables.findIndex(element => element._id === id);
            const { category, _id, src } = wearables[index];
            obj[category] = { _id, src };
            return obj;
        }, {});
        setAvatar(createAvatarObject(student.avatar));
    }, [student.avatar, view]);
    const closet = student.closet.map(_id => { // converting student.closet, which is an array of string IDs, to an array of objects
        const index = wearables.findIndex(element => element._id === _id);
        const thisWearable = wearables[index];
        return thisWearable;
    });
    const state = {
        view,
        avatar,
        closet,
        updateView: setView,
        updateAvatar: setAvatar
    }
    return (
        <Dashboard teacher={false}>
            <StudentProfileDropdown {...props} {...state} />
            <Sidebar>
                <div className="StudentSidebar">
                    <div className="avatarContainer">
                        <Avatar {...props} {...state} />
                    </div>
                    <div className="studentCoins">
                        <div className="coinsIcon"><img alt="coin icon" src="assets/Coin_ico.png" /></div>
                        <span className="coinsCount">{student.coins.toString()}</span>
                    </div>
                </div>
            </Sidebar>
            <Main {...props} {...state} />
            <Nav>
                <button className="stealth link" onClick={() => setView('home')}>Homework</button>
                <button className="stealth link" onClick={() => setView('closet')}>Closet</button>
                <button className="stealth link" onClick={() => setView('marketplace')}>Marketplace</button>
                <button className="stealth link" onClick={() => setView('badges')}>Badges</button>
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
        case 'closet': return <StudentCloset {...props} />
        case 'marketplace': return <StudentMarketplace {...props} />;
        case 'badges': return <StudentBadges {...props} />;
        default: return <Homework {...props} />;
    }
}

function Homework(props) {
    const { student } = props;
    const [homework, setHomework] = useState(null);
    const getHomework = async () => {
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
    const generateHomeworkModules = () => {
        return homework.map(homework => (
            <HomeworkModule key={`homeworkModule-${homework._id}`} {...props} {...homework} refreshHomework={getHomework} />
        ));
    };
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
    const homeworkAssignments = () => {
        return assignments.map((info, index) => (
            <Assignment key={`homeworkAssignment-${_id}-${index}`} {...props} index={index} {...info} _id={_id} />
        ));
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
                <Marketplace {...props} />
            </div>
        </div>
    );
}

function StudentCloset(props) {
    const { student, avatar } = props;
    const handleUpdateAvatar = async () => {
        const updatedAvatar = Object.keys(avatar).map(key => avatar[key]._id);
        const response = await fetch('/update/avatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: student._id,
                avatar: updatedAvatar
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        props.refreshData();
    }
    const unsavedChanges = () => {
        // there has got to be a better way todo this
        const previewAvatar = Object.keys(avatar).map(key => avatar[key]._id);
        const trueAvatar = student.avatar;
        if (trueAvatar.length !== previewAvatar.length) return true;
        const trueAvatarObject = {};
        const previewAvatarObject = {};
        for (let id of trueAvatar) trueAvatarObject[id] = true;
        for (let id of previewAvatar) previewAvatarObject[id] = true;
        // checking if the two arrays have equal contents (regardless of order)
        if ((previewAvatar.every(string => trueAvatarObject[string]))
        && (trueAvatar.every(string => previewAvatarObject[string]))) {
            return false;
        }
        else return true;
    }
    return (
        <div className="Main">
            <h1>Closet</h1>
            <Closet {...props} />
            {unsavedChanges() && <div className="buttons"><Button onClick={handleUpdateAvatar}>Save Changes</Button></div>}
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