import { useState, useEffect, useRef } from 'react';
import { Dashboard, Header, Sidebar } from './Dashboard';
import ViewStudent from './ViewStudent';
import Loading from './Loading';
import Modal from './Modal';
import ContextMenu from './ContextMenu';
import { getArrayIndexByKeyValue, shrinkit } from '../utils';
import Dropdown from './Dropdown';

export default function Teacher(props) {
    const { teacher } = props;
    const [view, setView] = useState({ type: 'home' });
    const [students, setStudents] = useState([]);
    const [wearables, setWearables] = useState([]);
    const [badges, setBadges] = useState([]);
    const [modal, setModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(false);
    const getTeacherData = async () => {
        const response = await fetch('/teacher/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: teacher._id })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        setStudents(body.students);
        setWearables(body.wearables);
        setBadges(body.badges);
        if (view.type === 'student') {
            const refreshCurrentStudent = (prevView) => {
                let thisStudent = prevView.data;
                let index = getArrayIndexByKeyValue('_id', thisStudent._id, body.students);
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
                defaultValue={{ value: students[0]._id, display: makeSureNameFits(students[0].firstName + ' ' + students[0].lastName) }}
                listItems={studentList}
                onChange={(_id) => setView({ type: 'student', data: students[students.findIndex(student => student._id === _id)] })}
            />
        )
    }
    const updateContextMenu = (e, content) => {
        const position = {
            top: `${e.clientY}px`,
            right: `${window.innerWidth - e.clientX}px`
        }
        setContextMenu({
            position,
            content
        });
    }
    const state = {
        view,
        students,
        wearables,
        badges,
        modal,
        updateView: setView,
        updateModal: setModal,
        updateContextMenu,
        refreshData: getTeacherData
    }
    return (
        <Dashboard teacher={true}>
            {modal && <Modal exit={() => setModal(false)} children={modal} />}
            {contextMenu && <ContextMenu {...contextMenu} updateContextMenu={setContextMenu} />}
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
                <span className="name">{teacher.username}</span>
                <span className="caret"></span>
            </button>
            <div className="pfp" onClick={toggleExpanded}>
                <img alt="pfp" src={teacher.profilePic ? teacher.profilePic : 'assets/defaultpfp.jpg' } />
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
            <Marketplace {...props} />
            <button onClick={addNewWearable}>Add new wearable</button>
        </div>
    )
}

function Marketplace(props) {
    const { teacher, wearables } = props;
    const [preview, setPreview] = useState({});
    const [category, setCategory] = useState(() => teacher.wearableCategories[0]);
    const wearableRefs = useRef({});
    const editOrDeleteWearable = (e, _id) => {
        e.preventDefault();
        const index = wearables.findIndex(wearable => wearable._id === _id);
        const thisWearable = wearables[index];
        const editWearable = () => props.updateModal(<AddOrEditWearable {...props} wearable={thisWearable} />);
        const deleteWearable = () => {
            const handleDelete = async (e) => {
                e.preventDefault();
                props.updateModal(content({ loadingIcon: true }));
                const response = await fetch('/delete/wearable', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success response from server');
                shrinkit(wearableRefs.current[_id], true);
                props.refreshTeacher();
                props.refreshData();
                props.updateModal(false);
            }
            let content = (options = {
                loadingIcon: false
            }) => (
                <div className="modalBox">
                    <h2>Are you sure?</h2>
                    <img alt={thisWearable.name} src={thisWearable.src} style={{ float: 'right' }} />
                    Are you sure you want to delete the wearable "{thisWearable.name}"? This action cannot be undone.
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
                <li><button onClick={editWearable}>Edit</button></li>
                <li><button onClick={deleteWearable}>Delete</button></li>
            </ul>
        );
        props.updateContextMenu(e, content);
    }
    const updatePreview = ({ category, name, src, value }) => {
        if (preview[category] && preview[category].name === name) {
            const previewObjectMinusCategory = (prevState) => {
                const object = {...prevState};
                delete object[category];
                return object;
            }
            setPreview(prevState => ({
                ...previewObjectMinusCategory(prevState)
            }));
            return;
        }
        setPreview(prevState => ({
            ...prevState,
            [category]: { name, src, value }
        }));
    }
    const addOrEditCategory = (e, originalName) => {
        e.preventDefault();
        const editingCategory = teacher.wearableCategories.includes(originalName);
        const handleAddOrEditCategory = async (e, categoryName) => {
            e.preventDefault();
            props.updateModal(content({ loadingIcon: true }));
            const fromDropdown = !!categoryName;
            const ROUTE = editingCategory ? '/edit/wearableCategory' : '/add/wearableCategory';
            const formData = editingCategory
                ?   {
                        _id: teacher._id,
                        originalName,
                        updatedName: e.target[0].value
                    }
                :   {
                        _id: teacher._id,
                        categoryName: fromDropdown ? categoryName : e.target[0].value
                    }
            const response = await fetch(ROUTE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success response from server');
            props.refreshTeacher();
            if (editingCategory) {
                props.refreshData(); // in case any wearables were affected by category name change
                if (category === originalName) setCategory(e.target[0].value);
            }
            props.updateModal(false);
        }
        let content = (options = {
            loadingIcon: false
        }) => (
            <div className="modalBox">
                <h2>{editingCategory ? 'Edit' : 'Add new'} category</h2>
                <form onSubmit={handleAddOrEditCategory} autoComplete="off">
                    <label htmlFor="categoryName">Category name:</label>
                    <input type="text" name="categoryName" defaultValue={editingCategory ? originalName : ''} />
                    <div className="buttons">
                        {options.loadingIcon
                            ? <Loading />
                            : <input type="submit" />
                        }
                    </div>
                </form>
            </div>
        );
        props.updateModal(content);
    }
    const editCategory = (e, categoryName) => {
        e.preventDefault();
        let content = (
            <ul className="editDelete">
                <li><button onClick={(e) => addOrEditCategory(e, categoryName)}>Edit</button></li>
            </ul>
        );
        props.updateContextMenu(e, content);
    }
    const generatePreview = (preview) => {
        const images = [];
        for (let category in preview) {
            images.push(<img key={`marketplacePreview-${category}`} src={preview[category].src} className={category} />);
        }
        return <div className="previewBox">{images}</div>;
    }
    const generatePreviewDescription = (preview) => {
        const previewItems = [];
        for (let category in preview) {
            previewItems.push(
                <li key={`marketplacePreviewDescription-${category}`}>
                    <span className="wearableName">{preview[category].name}</span>
                    <button>
                        <img className="coin" alt="coin icon" src="assets/Coin_ico.png" />
                        <span className="wearableValue">{preview[category].value}</span>
                    </button>
                </li>
            )
        }
        return (
            <ul className="previewDescription">
                <h3>Shopping Cart</h3>
                {previewItems}
            </ul>
        );
    }
    const generateCategories = (categories) => {
        const array = categories.map(category => (
            <button
              key={`wearableCategories-toolbar-${category}`}
              className="stealth"
              onClick={() => setCategory(category)}
              onContextMenu={(e) => editCategory(e, category)}>
                {category}
            </button>
        ))
        array.push(<button key="wearableCategories-toolbar-addNew" className="add" onClick={addOrEditCategory}></button>)
        return array;
    }
    const generateWearables = (category) => {
        const filteredList = wearables.filter(wearable => wearable.category === category);
        return filteredList.map(wearable => (
            <button
              ref={(el) => wearableRefs.current[wearable._id] = el}
              key={`${category}-wearable-${wearable.name}`}
              className="stealth wearableItem"
              onClick={() => updatePreview(wearable)}
              onContextMenu={(e) => editOrDeleteWearable(e, wearable._id)}>
                <img
                    alt={wearable.name}
                    src={wearable.src}
                />
                <span className="wearableName">{wearable.name}</span>
                <img className="coin" alt="coin icon" src="assets/Coin_ico.png" />
                <span className="wearableValue">{wearable.value}</span>
            </button>
        ));
    }
    return (
        <div className="Marketplace">
            <div className="marketplacePreview">
                {generatePreview(preview)}
                {generatePreviewDescription(preview)}
            </div>
            <div className="marketplaceCategories">
                {generateCategories(teacher.wearableCategories)}
            </div>
            <div className="marketplaceWearables">
                <div className="wearablesGrid">
                    {generateWearables(category)}
                </div>
            </div>
        </div>
    )
}

function AddOrEditWearable(props) {
    const { teacher, wearable } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [formData, setFormData] = useState({
        _id: wearable ? wearable._id : '',
        teacherCode: wearable ? wearable.teacherCode : teacher._id,
        name: wearable ? wearable.name : '',
        category: wearable ? wearable.category : teacher.wearableCategories[0],
        src: wearable ? wearable.src : '',
        value: wearable ? wearable.value : ''
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
        const ROUTE = wearable ? '/edit/wearable' : '/add/wearable';
        const response = await fetch(ROUTE, {
            method: 'POST',
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
    const addCategory = async (categoryName) => {
        const response = await fetch('/add/wearableCategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: teacher._id,
                categoryName
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        props.refreshTeacher();
    }
    const dropdownListItems = () => {
        const listItems = teacher.wearableCategories.map(item => ({
            value: item,
            display: item
        }));
        console.table(listItems);
        return listItems;
    }
    return (
        <div className="modalBox">
            <form className="pad" onSubmit={handleSubmit}>
                <h2>Add new wearable</h2>
                <label htmlFor="name">Wearable name:</label>
                <input type="text" defaultValue={wearable ? wearable.name : ''} onChange={(e) => updateFormData('name', e.target.value)} />
                <label htmlFor="value">Category:</label>
                <Dropdown
                    minWidth="10rem"
                    defaultValue={{ value: formData.category, display: formData.category }}
                    listItems={dropdownListItems()}
                    addNew={addCategory}
                    onChange={(value) => updateFormData('category', value)} />
                <label htmlFor="src">Image link:</label>
                <input type="text" defaultValue={wearable ? wearable.src : ''} onChange={(e) => updateFormData('src', e.target.value)} />
                <label htmlFor="value">Wearable value:</label>
                <input type="text" defaultValue={wearable ? wearable.value : ''} onChange={(e) => updateFormData('value', e.target.value)} />
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
                const response = await fetch('/delete/badge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id })
                });
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
        const ROUTE = badge ? '/edit/badge' : '/add/badge';
        const response = await fetch(ROUTE, {
            method: 'POST',
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
    return (
        <div className="Main">
            <h1>My Account</h1>
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