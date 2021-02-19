import { useState, useEffect, useRef } from 'react';
import { Dashboard, Header, Sidebar } from './Dashboard';
import ViewStudent from './ViewStudent';
import Marketplace, { AddOrEditWearable } from './Marketplace';
import Loading from './Loading';
import ContextMenu from './ContextMenu';
import { shrinkit } from '../utils';
import Button from './Button';
import Dropdown from './Dropdown';

export default function Teacher(props) {
    const { teacher } = props;
    const [view, setView] = useState({ type: 'home' });
    const [students, setStudents] = useState([]);
    const [wearables, setWearables] = useState([]);
    const [badges, setBadges] = useState([]);
    const getTeacherData = async () => {
        const response = await fetch(`/teacher/${teacher._id}`);
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        setStudents(body.students);
        setWearables(body.wearables);
        setBadges(body.badges);
        if (view.type === 'student') {
            const refreshCurrentStudent = (prevView) => {
                let thisStudent = prevView.data;
                let index = body.students.findIndex(student => student._id === thisStudent._id);
                return body.students[index];
            }
            setView(prevView => ({
                type: 'student',
                data: refreshCurrentStudent(prevView)
            }));
        }
    }
    useEffect(() => {
        getTeacherData();
    }, [teacher._id]);
    const generateStudentList = () => {
        if (!students.length) return 'No students yet!';
        const makeSureNameFits = (string) => {
            if (string.length < 18) return string;
            let shortenedString = string.substring(0, 17);
            return shortenedString + '...';
        }
        const studentList = students.map(student => ({
            value: student._id,
            display: makeSureNameFits(student.firstName + ' ' + student.lastName)
        }));
        return (
            <Dropdown
                minWidth="12rem"
                restoreDefault={view.type !== 'student'}
                defaultValue={{ value: null, display: 'Select one...' }}
                listItems={studentList}
                onChange={(_id) => setView({ type: 'student', data: students[students.findIndex(student => student._id === _id)] })}
            />
        );
    }
    const state = {
        view,
        students,
        wearables,
        badges,
        updateView: setView,
        refreshData: getTeacherData
    }
    return (
        <Dashboard teacher={true}>
            <TeacherProfileDropdown {...props} {...state} />
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
            <Main {...props} {...state} />
        </Dashboard>
    );
}

function TeacherProfileDropdown(props) {
    const { teacher } = props;
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => setExpanded(prevState => !prevState);
    return (
        <Header className={expanded ? 'expanded' : ''}>
            <button onClick={toggleExpanded}>
                <span className="name">{teacher.firstName}</span>
                <span className="caret"></span>
            </button>
            <div className="pfp" onClick={toggleExpanded}>
                <img alt="pfp" src={teacher.profilePic ? teacher.profilePic : 'assets/defaultpfp.jpg' } />
            </div>
            <ContextMenu
              position={null}
              ignoreClick={['.User .pfp', '.User > button']}
              updateContextMenu={() => setExpanded(false)}
              children={(
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
    switch (view.type) {
        case 'home': return <Home {...props} />;
        case 'student': return <ViewStudent {...props} student={view.data} />;
        case 'marketplace': return <TeacherMarketplace {...props} />;
        case 'badges': return <TeacherBadges {...props} />;
        case 'account': return <MyAccount {...props} />;
        case 'settings': return <Settings {...props} />;
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
    );
}

function TeacherMarketplace(props) {
    const { teacher, modal } = props;
    const [wearableModal, setWearableModal] = useState(false);
    useEffect(() => {
        if (!modal) setWearableModal(false);
    }, [modal]);
    useEffect(() => {
        if (wearableModal) addNewWearable();
    }, [teacher]);
    const addNewWearable = () => {
        props.updateModal(<AddOrEditWearable {...props} />);
        setWearableModal(true);
    }
    return (
        <div className="Main">
            <h1>Marketplace</h1>
            <Marketplace {...props} viewingAsTeacher={true} />
            <button onClick={addNewWearable}>Add new wearable</button>
        </div>
    );
}

function TeacherBadges(props) {
    const addNewBadge = () => {
        props.updateModal(<AddOrEditBadge {...props} />)
    }
    return (
        <div className="Main">
            <h1>Badges</h1>
            <Badges {...props} />
            <button onClick={addNewBadge}>Add new badge</button>
        </div>
    )
}

function Badges(props) {
    const { badges } = props;
    const badgesRef = useRef({});
    const editOrDeleteBadge = (e, _id) => {
        e.preventDefault();
        const index = badges.findIndex(badge => badge._id === _id);
        const thisBadge = badges[index];
        const editBadge = () => props.updateModal(<AddOrEditBadge {...props} badge={badges[index]} />);
        const deleteBadge = () => {
            const handleDelete = async () => {
                props.updateModal(content({ loadingIcon: true }));
                const response = await fetch(`/badge/${_id}`, { method: 'DELETE' });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success response from server');
                shrinkit(badgesRef.current[_id], true);
                props.refreshTeacher();
                props.refreshData();
                props.updateModal(false);
            }
            let content = (options = {
                loadingIcon: false
            }) => (
                <div className="modalBox">
                    <h2>Are you sure?</h2>
                    <img alt={thisBadge.name} src={thisBadge.src} style={{ float: 'right' }} />
                    Are you sure you want to delete the badge "{thisBadge.name}"? This action cannot be undone.
                    <div className="buttons">
                        {options.loadingIcon
                            ?   <Loading />
                            :   <form onSubmit={handleDelete}>
                                    <button type="submit">Yes, I'm sure</button>
                                    <button type="button" className="greyed" onClick={() => props.updateModal(false)}>Cancel</button>
                                </form>
                            }
                    </div>
                </div>
            )
            props.updateModal(content());
        }
        let content = (
            <ul className="editDelete">
                <li><button onClick={editBadge}>Edit</button></li>
                <li><button onClick={deleteBadge}>Delete</button></li>
            </ul>
        );
        props.updateContextMenu(e, content);
    }
    const generateBadgeList = () => {
        return badges.map(badge => (
            <div
              key={`badgeList-${badge._id}`}
              ref={(el) => badgesRef.current[badge._id] = el}
              className="badgeItem">
                <img alt={badge.name} src={badge.src} onContextMenu={(e) => editOrDeleteBadge(e, badge._id)} />
                <span className="badgeName">{badge.name}</span>
                <span className="badgeValue">{badge.value}</span>
            </div>
        ));
    }
    return (
        <div className="BadgeList">
            {generateBadgeList()}
        </div>
    )
}

function AddOrEditBadge(props) {
    const { teacher, badge } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [formData, setFormData] = useState({
        _id: badge ? badge._id : '',
        teacherCode: badge ? badge.teacherCode : teacher._id,
        name: badge ? badge.name : '',
        src: badge ? badge.src : '',
        value: badge ? badge.value : ''
    });
    const updateFormData = (key, value) => {
        setFormData(prevState => ({
            ...prevState,
            [key]: value
        }));
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingIcon(true);
        const ROUTE = badge ? `/badge/${badge._id}` : '/badge';
        const response = await fetch(ROUTE, {
            method: badge ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        props.updateModal(false);
        props.refreshData();
    }
    return (
        <div className="modalBox">
            <form className="pad" onSubmit={handleSubmit}>
                <h2>{badge ? 'Edit this' : 'Add new'} badge</h2>
                <label htmlFor="name">Badge name:</label>
                <input type="text" defaultValue={badge ? badge.name : ''} onChange={(e) => updateFormData('name', e.target.value)} />
                <label htmlFor="src">Image link:</label>
                <input type="text" defaultValue={badge ? badge.src : ''} onChange={(e) => updateFormData('src', e.target.value)} />
                <label htmlFor="value">Badge value:</label>
                <input type="text" defaultValue={badge ? badge.value : ''} onChange={(e) => updateFormData('value', e.target.value)} />
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

function MyAccount(props) {
    const { teacher } = props;
    const [formData, setFormData] = useState({
        firstName: teacher.firstName ?? '',
        lastName: teacher.lastName ?? '',
        username: teacher.username ?? '',
        email: teacher.email ?? '',
        profilePic: teacher.profilePic || '',
    });
    const [formSuccess, setFormSuccess] = useState(false);
    const [passwordFormData, setPasswordFormData] = useState({
        newPassword: '',
        confirmNewPassword: ''
    });
    const [passwordFormSuccess, setPasswordFormSuccess] = useState(false);
    const changePasswordForm = useRef(null);
    const updateFormData = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const updatePasswordFormData = (e) => {
        setPasswordFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const passwordsMatch = () => {
        const { newPassword, confirmNewPassword } = passwordFormData;
        if (newPassword === '' || confirmNewPassword === '') return false;
        if (newPassword === confirmNewPassword) return true;
        return false;
    }
    const handleSubmit = async () => {
        const response = await fetch(`/teacher/${teacher._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        props.refreshTeacher();
        setFormSuccess(true);
        setFormSuccess(false);
    }
    const handleChangePassword = async () => {
        if (!passwordsMatch()) return;
        const { newPassword } = passwordFormData;
        const response = await fetch(`/teacher/${teacher._id}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        props.refreshTeacher();
        setPasswordFormSuccess(true);
        setPasswordFormSuccess(false);
        setTimeout(() => {
            changePasswordForm.current.reset();
        }, 2000);
    }
    return (
        <div className="Main MyAccount">
            <h1>My Account</h1>
            <form className="dark divide" autoComplete="off">
                <h2>Edit account details</h2>
                <div className="profilePic">
                    <img alt="profile pic" src={teacher.profilePic || 'assets/defaultpfp.jpg'} />
                    <div>
                        <label htmlFor="profilePic">Profile picture:</label>
                        <input
                          name="profilePic"
                          type="text"
                          defaultValue={teacher.profilePic}
                          onChange={updateFormData} />
                    </div>
                </div>
                <div className="half">
                    <div>
                        <label htmlFor="firstName">First name:</label>
                        <input
                          name="firstName"
                          type="text"
                          defaultValue={teacher.firstName}
                          onChange={updateFormData} />
                    </div>
                    <div>
                        <label htmlFor="lastName">Last name:</label>
                        <input
                          name="lastName"
                          type="text"
                          defaultValue={teacher.lastName}
                          onChange={updateFormData} />
                    </div>
                </div>
                <div className="half">
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input
                          name="username"
                          type="text"
                          defaultValue={teacher.username}
                          onChange={updateFormData} />
                    </div>
                    <div>
                        <label htmlFor="email">Email address:</label>
                        <input
                          name="email"
                          type="text"
                          defaultValue={teacher.email}
                          onChange={updateFormData} />
                    </div>
                </div>
                <Button type="submit" success={formSuccess} onClick={handleSubmit}>Save Changes</Button>
            </form>
            <form className="dark divide" autoComplete="off" ref={changePasswordForm}>
                <h2>Change password</h2>
                <div className="half">
                    <div>
                        <label htmlFor="newPassword">New password:</label>
                        <input name="newPassword" type="password" onInput={updatePasswordFormData} />
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword">Confirm new password:</label>
                        <input name="confirmNewPassword" type="password" onInput={updatePasswordFormData} />
                    </div>
                </div>
                <Button type="submit" success={passwordFormSuccess} onClick={handleChangePassword} disabled={!passwordsMatch()}>Save Changes</Button>
            </form>
        </div>
    );
}

function Settings(props) {
    return (
        <div className="Main">
            <h1>Settings</h1>
        </div>
    );
}