import { useState, useEffect } from 'react';
import { Dashboard, Header, Sidebar } from './Dashboard';
import ViewStudent from './ViewStudent';
import Loading from './Loading';
import Modal from './Modal';
import Marketplace from './Marketplace';
import { getArrayIndexByKeyValue } from '../utils';

export default function Teacher(props) {
    const { teacher } = props;
    const [view, setView] = useState({ type: 'home' });
    const [students, setStudents] = useState([]);
    const [wearables, setWearables] = useState([]);
    const [modal, setModal] = useState(false);
    const getTeacherData = async () => {
        console.log('refreshed teacher data');
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
        if (view.type === 'student') {
            const refreshThisStudent = (prevView) => {
                console.log('refreshing student');
                let thisStudent = prevView.data;
                let index = getArrayIndexByKeyValue('_id', thisStudent._id, students);
                return students[index];
            }
            setView(prevView => ({
                type: 'student',
                data: refreshThisStudent(prevView)
            }));
        }
    }
    const state = {
        view,
        students,
        wearables,
        modal,
        updateModal: setModal,
        refreshData: getTeacherData
    }
    useEffect(() => {
        getTeacherData();
    }, [teacher._id]);
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
        <Dashboard teacher={true}>
            {modal && <Modal exit={() => setModal(false)} children={modal} />}
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
    const addNewWearable = () => {
        props.updateModal(<AddNewWearable {...props} />)
    }
    return (
        <div className="Main">
            marketplace!
            <Marketplace {...props} />
            <ul>
                <li>add new wearables</li>
                <li>edit/delete existing wearables</li>
            </ul>
            <button onClick={addNewWearable}>Add new wearable</button>
        </div>
    )
}

function AddNewWearable(props) {
    const { teacher } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [formData, setFormData] = useState({
        teacherCode: teacher._id,
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