import { useState, useEffect, useRef } from 'react';
import { Dashboard, Header, Sidebar, Nav } from './Dashboard';
import ViewStudent from './ViewStudent';
import Marketplace from './Marketplace';
import Loading from './Loading';
import ContextMenu from './ContextMenu';
import { shrinkit } from '../utils';
import MyAccount from './MyAccount';
import Dropdown from './Dropdown';

export default function Teacher(props) {
    const { teacher, students } = props;
    const [view, setView] = useState({ type: 'home' });
    useEffect(() => {
        if (view.type === 'student') {
            const refreshCurrentStudent = (prevView) => {
                let thisStudent = prevView.data;
                let index = students.findIndex(student => student._id === thisStudent._id);
                return students[index];
            }
            setView(prevView => ({
                type: 'student',
                data: refreshCurrentStudent(prevView)
            }));
        }
    }, [students]);
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
                style={{ minWidth: '14rem' }}
                restoreDefault={view.type !== 'student'}
                defaultValue={{ value: null, display: 'Select one...' }}
                listItems={studentList}
                onChange={(_id) => setView({ type: 'student', data: students[students.findIndex(student => student._id === _id)] })}
            />
        );
    }
    const state = {
        view,
        updateView: setView
    }
    return (
        <Dashboard teacher={true}>
            <Header>
                <Nav>
                    <button onClick={() => setView({ type: 'home' })}>Home</button>
                    <button onClick={() => setView({ type: 'marketplace' })}>Marketplace</button>
                    <button onClick={() => setView({ type: 'badges' })}>Badges</button>
                </Nav>
                <TeacherProfileDropdown {...props} {...state} />
            </Header>
            <Sidebar>
                <h2>Students</h2>
                {generateStudentList()}
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
        <div className={`User${expanded ? ' expanded' : ''}`}>
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
        </div>
    )
}

function Main(props) {
    const { view, teacher } = props;
    switch (view.type) {
        case 'home': return <Home {...props} />;
        case 'student': return <ViewStudent {...props} student={view.data} />;
        case 'marketplace': return <TeacherMarketplace {...props} />;
        case 'badges': return <TeacherBadges {...props} />;
        case 'account': return <MyAccount {...props} userType="teacher" user={teacher} />;
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
    return (
        <div className="Main">
            <h1>Marketplace</h1>
            <Marketplace {...props} viewingAsTeacher={true} />
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
    const awardBadge = (_id) => {
        const index = badges.findIndex(badge => badge._id === _id);
        const thisBadge = badges[index];
        props.updateModal(<AwardBadge {...props} badge={thisBadge} />);
    }
    const editOrDeleteBadge = (e, _id) => {
        e.preventDefault();
        const index = badges.findIndex(badge => badge._id === _id);
        const thisBadge = badges[index];
        const editBadge = () => props.updateModal(<AddOrEditBadge {...props} badge={thisBadge} />);
        const deleteBadge = () => {
            const handleDelete = async () => {
                props.updateModal(content({ loadingIcon: true }));
                const response = await fetch(`/badge/${_id}`, { method: 'DELETE' });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success response from server');
                shrinkit(badgesRef.current[_id], true);
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
                <img
                  alt={badge.name}
                  src={badge.src}
                  className="badgeImage"
                  onClick={() => awardBadge(badge._id)}
                  onContextMenu={(e) => editOrDeleteBadge(e, badge._id)} />
                <span className="badgeName">{badge.name}</span>
                <span>
                    <img alt="coin icon" className="coin" src="assets/Coin_ico.png" />
                    <span className="badgeValue">{badge.value}</span>
                </span>
            </div>
        ));
    }
    return (
        <div className="BadgeList">
            {generateBadgeList()}
        </div>
    )
}

function AwardBadge(props) {
    const { students, badge } = props;
    const [recipient, setRecipient] = useState(null); // student id
    const [error, setError] = useState(false);
    const [loadingIcon, setLoadingIcon] = useState(false);
    const makeSureNameFits = (string) => {
        if (string.length < 18) return string;
        let shortenedString = string.substring(0, 17);
        return shortenedString + '...';
    }
    const studentList = students.map(student => ({
        value: student._id,
        display: makeSureNameFits(student.firstName + ' ' + student.lastName)
    }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipient) return setError('Please select a student!');
        setLoadingIcon(true);
        const response = await fetch(`/student/${recipient}/badges`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ badgeId: badge._id })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) {
            setLoadingIcon(false);
            return setError(body.error);
        }
        props.updateModal(false);
        props.refreshData();
    }
    const updateRecipient = (_id) => {
        setError(false);
        setRecipient(_id);
    }
    return (
        <div className="modalBox">
            <h2>Award this badge</h2>
            <p>Choose a student to award this badge to:</p>
            <div style={{ textAlign: 'center' }}>
                <Dropdown
                    style={{ minWidth: '15rem', marginBottom: '0.2rem' }}
                    defaultValue={{ value: null, display: 'Select one...' }}
                    listItems={studentList}
                    onChange={updateRecipient}/>
                {error && <span className="error">{error}</span>}
            </div>
            <form onSubmit={handleSubmit} className="buttons">
                {loadingIcon
                    ? <Loading />
                    : <input type="submit" />
                }
            </form>
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
        if (!body.success) return console.log(body.error);
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

function Settings(props) {
    return (
        <div className="Main">
            <h1>Settings</h1>
        </div>
    );
}