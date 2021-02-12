import { useState, useEffect } from 'react';
import { Dashboard, Header, Sidebar } from './Dashboard';
import ViewStudent from './ViewStudent';
import Loading from './Loading';
import Modal from './Modal';
import ContextMenu from './ContextMenu';
import { getArrayIndexByKeyValue } from '../utils';
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
        const studentList = [];
        for (let student of students) {
            studentList.push(
                <li key={student._id}><button className="stealth link" onClick={() => setView({ type: 'student', data: student })}>{student.firstName} {student.lastName}</button></li>
            );
        }
        return <ul className="stealth">{studentList}</ul>;
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
        updateModal: setModal,
        updateContextMenu,
        refreshData: getTeacherData
    }
    return (
        <Dashboard teacher={true}>
            {modal && <Modal exit={() => setModal(false)} children={modal} />}
            {contextMenu && <ContextMenu {...contextMenu} updateContextMenu={setContextMenu} />}
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
            <Main {...props} {...state} />
        </Dashboard>
    );
}

function Main(props) {
    const { view } = props;
    switch (view.type) {
        case 'home': return <Home {...props} />;
        case 'student': return <ViewStudent {...props} student={view.data} />;
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
    const editOrDeleteWearable = (e, _id) => {
        e.preventDefault();
        const editWearable = () => {
            const index = wearables.findIndex(wearable => wearable._id === _id);
            props.updateModal(<AddOrEditWearable {...props} wearable={wearables[index]} />)
        }
        let content = (
            <ul>
                <li><button className="stealth link" onClick={editWearable}>Edit</button></li>
                <li><button className="stealth link">Delete</button></li>
            </ul>
        );
        props.updateContextMenu(e, content);
    }
    const updatePreview = ({ category, src, name }) => {
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
            [category]: { src, name }
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
    const editOrDeleteCategory = (e, categoryName) => {
        e.preventDefault();
        let content = (
            <ul>
                <li><button className="stealth link" onClick={(e) => addOrEditCategory(e, categoryName)}>Edit</button></li>
                <li><button className="stealth link">Delete</button></li>
            </ul>
        );
        props.updateContextMenu(e, content);
    }
    const generatePreview = (preview) => {
        const images = [];
        for (let category in preview) {
            images.push(<img key={`marketplacePreview-${category}`} src={preview[category].src} className={category} />);
        }
        return images;
    }
    const generateCategories = (categories) => {
        const array = [];
        for (let category of categories) {
            array.push(
                <button
                  key={`wearableCategories-toolbar-${category}`}
                  className="stealth"
                  onClick={() => setCategory(category)}
                  onContextMenu={(e) => editOrDeleteCategory(e, category)}>
                    {category}
                </button>
            );
        }
        array.push(<button key="wearableCategories-toolbar-addNew" className="add" onClick={addOrEditCategory}></button>)
        return array;
    }
    const generateWearables = (category) => {
        const filteredList = wearables.filter(wearable => wearable.category === category);
        const array = [];
        for (let wearable of filteredList) {
            array.push(
                <div className="wearableItem" key={`${category}-wearable-${wearable.name}`}>
                    <button className="stealth">
                        <img
                            alt={wearable.name}
                            src={wearable.src}
                            onClick={() => updatePreview(wearable)}
                            onContextMenu={(e) => editOrDeleteWearable(e, wearable._id)} />
                    </button>
                </div>
            );
        }
        return array;
    }
    return (
        <div className="Marketplace">
            <div className="marketplacePreview">
                {generatePreview(preview)}
            </div>
            <div className="marketplaceCategories">
                {generateCategories(teacher.wearableCategories)}
            </div>
            <div className="marketplaceWearables">
                {generateWearables(category)}
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
    return (
        <div className="modalBox">
            <form className="pad" onSubmit={handleSubmit}>
                <h2>Add new wearable</h2>
                <label htmlFor="name">Wearable name:</label>
                <input type="text" defaultValue={wearable ? wearable.name : ''} onChange={(e) => updateFormData('name', e.target.value)} />
                <label htmlFor="value">Category:</label>
                <Dropdown
                    minWidth="10rem"
                    defaultValue={formData.category}
                    listItems={teacher.wearableCategories}
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
    const editOrDeleteBadge = (e, _id) => {
        e.preventDefault();
        const editBadge = () => {
            const index = badges.findIndex(badge => badge._id === _id);
            props.updateModal(<AddOrEditBadge {...props} badge={badges[index]} />)
        }
        let content = (
            <ul>
                <li><button className="stealth link" onClick={editBadge}>Edit</button></li>
                <li><button className="stealth link">Delete</button></li>
            </ul>
        );
        props.updateContextMenu(e, content);
    }
    const generateBadgeList = () => {
        let array = [];
        for (let badge of badges) {
            array.push(
                <div className="badgeItem" key={`badgeList-${badge._id}`}>
                    <img alt={badge.name} src={badge.src} onContextMenu={(e) => editOrDeleteBadge(e, badge._id)} />
                    <span className="badgeName">{badge.name}</span>
                    <span className="badgeValue">{badge.value}</span>
                </div>
            )
        }
        return array;
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