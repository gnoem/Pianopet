import { useState, useEffect, useRef } from 'react';
import { Dashboard, Header, Sidebar, Nav } from './Dashboard';
import Closet from './Closet';
import Avatar from './Avatar';
import Marketplace from './Marketplace';
import ContextMenu from './ContextMenu';
import { prettifyDate } from '../utils';
import Button from './Button';
import MyAccount from './MyAccount';

export default function Student(props) {
    const { student, wearables } = props;
    const [view, setView] = useState('home');
    const [avatar, setAvatar] = useState(null);
    useEffect(() => {
        // the following function converts student.avatar, which is an array of string IDs, to an object with category names as keys
        const createAvatarObject = (avatarArray) => avatarArray.reduce((obj, id) => {
            const index = wearables.findIndex(element => element._id === id);
            const { category, _id, name, src, image } = wearables[index];
            obj[category] = { _id, name, src, image };
            return obj;
        }, {});
        setAvatar(createAvatarObject(student.avatar));
    }, [student.avatar, view]);
    const closet = student.closet.map(_id => { // converting student.closet, which is an array of string IDs, to an array of objects
        const index = wearables.findIndex(element => element._id === _id);
        const thisWearable = wearables[index];
        return thisWearable;
    });
    const formatCoins = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const state = {
        view,
        avatar,
        closet,
        updateView: setView,
        updateAvatar: setAvatar
    }
    return (
        <Dashboard teacher={false}>
            <Header>
                <Nav>
                    <button className="stealth link" onClick={() => setView('home')}>Home</button>
                    <button className="stealth link" onClick={() => setView('closet')}>Closet</button>
                    <button className="stealth link" onClick={() => setView('marketplace')}>Marketplace</button>
                    <button className="stealth link" onClick={() => setView('badges')}>Badges</button>
                </Nav>
                <StudentProfileDropdown {...props} {...state} />
            </Header>
            <Sidebar>
                <div className="StudentSidebar">
                    <div className="avatarContainer">
                        <Avatar {...props} {...state} />
                    </div>
                    <div className="studentStats">
                        <img className="statsIcon" alt="coin icon" src="assets/Coin_ico.png" />
                        <span className="statsLabel" onClick={() => setView('marketplace')}>{formatCoins(student.coins)}</span>
                        <img className="statsIcon" alt="badge icon" src="assets/Badge_ico.svg" />
                        <span className="statsLabel" onClick={() => setView('badges')}>{student.badges.length.toString()}</span>
                    </div>
                </div>
            </Sidebar>
            <Main {...props} {...state} />
        </Dashboard>
    );
}

function StudentProfileDropdown(props) {
    const { student } = props;
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded(prevState => !prevState);
    return (
        <div className={`User ${expanded ? ' expanded' : ''}`}>
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
              children={(
                <ul>
                    <li><button className="myAccount" onClick={() => props.updateView('account')}>My Account</button></li>
                    <li><button className="settings" onClick={() => props.updateView('settings')}>Settings</button></li>
                    <li><button className="logout" onClick={props.logout}>Logout</button></li>
                </ul>
            )} />
        </div>
    )
}

function Main(props) {
    const { view, student } = props;
    switch (view) {
        case 'home': return <Homework {...props} />;
        case 'closet': return <StudentCloset {...props} />
        case 'marketplace': return <StudentMarketplace {...props} />;
        case 'badges': return <StudentBadges {...props} />;
        case 'account': return <MyAccount {...props} userType="student" user={student} />;
        default: return <Homework {...props} />;
    }
}

function Homework(props) {
    const { student } = props;
    const [homework, setHomework] = useState(null);
    const getHomework = async () => {
        const response = await fetch(`/student/${student._id}/homework`);
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
                {homework ? generateHomeworkModules() : ''}
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
        const response = await fetch(`/assignment/${_id}/progress`, {
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
        const response = await fetch(`student/${student._id}/avatar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
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
            {unsavedChanges() && <div className="buttons"><Button onClick={handleUpdateAvatar} className="slideUpIn">Save Changes</Button></div>}
        </div>
    );
}

function StudentBadges(props) {
    const { student, badges } = props;
    const badgesRef = useRef({});
    const generateBadgeList = () => {
        if (!student.badges.length) return "You haven't earned any badges yet!";
        return badges.map(badge => {
            const index = student.badges.findIndex(object => object.id === badge._id);
            const studentHasBadge = index !== -1;
            const badgeHasBeenRedeemed = () => {
                if (!studentHasBadge) return;
                if (student.badges[index].redeemed) return true;
                return false;
            }
            const redeemBadge = async () => {
                if (badgeHasBeenRedeemed()) return;
                badgesRef.current[badge._id].classList.add('redeemed');
                const response = await fetch(`/student/${student._id}/badge/redeemed`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        badgeId: badge._id,
                        badgeValue: badge.value
                    })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success response from server');
                props.refreshData();
            }
            if (studentHasBadge) return (
                <div
                  key={`badgeList-${badge._id}`}
                  ref={(el) => badgesRef.current[badge._id] = el}
                  className={`badgeItem${badgeHasBeenRedeemed() ? ' redeemed' : ''}`}>
                    <img
                        className="badgeImage"
                        alt={badge.name}
                        src={badge.src} />
                    <span className="badgeName">{badge.name}</span>
                    <span onClick={redeemBadge}>
                        <img className="coin" alt="coin icon" src="assets/Coin_ico.png" />
                        <span className="badgeValue">{badge.value}</span>
                    </span>
                </div>
            );
        });
    }
    return (
        <div className="Main">
            <div className="StudentBadges">
                <h1>My Badges</h1>
                <div className="BadgeList">
                    {generateBadgeList()}
                </div>
            </div>
        </div>
    );
}