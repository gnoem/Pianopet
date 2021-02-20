import { useState, useRef, useEffect } from 'react';
import Loading from './Loading';
import { shrinkit } from '../utils';
import Dropdown from './Dropdown';

export default function Marketplace(props) {
    const { viewingAsTeacher, student, teacher, wearables } = props;
    const [preview, setPreview] = useState({});
    const [category, setCategory] = useState(() => teacher.wearableCategories[0]);
    const wearableRefs = useRef({});
    const editOrDeleteWearable = (e, _id) => {
        e.preventDefault();
        if (!viewingAsTeacher) return;
        const index = wearables.findIndex(wearable => wearable._id === _id);
        const thisWearable = wearables[index];
        const editWearable = () => props.updateModal(<AddOrEditWearable {...props} wearable={thisWearable} />);
        const deleteWearable = () => {
            const handleDelete = async (e) => {
                e.preventDefault();
                props.updateModal(content({ loadingIcon: true }));
                const response = await fetch(`/wearable/${_id}`, { method: 'DELETE' });
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
    const updatePreview = ({ category, _id, name, src, value }) => {
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
            [category]: { _id, name, src, value }
        }));
    }
    const addOrEditCategory = (e, originalName) => {
        e.preventDefault();
        if (!viewingAsTeacher) return;
        const editingCategory = teacher.wearableCategories.includes(originalName);
        const handleAddOrEditCategory = async (e, categoryName) => {
            e.preventDefault();
            props.updateModal(content({ loadingIcon: true }));
            const fromDropdown = !!categoryName;
            const formData = editingCategory
                ?   { originalName, updatedName: e.target[0].value }
                :   { categoryName: fromDropdown ? categoryName : e.target[0].value }
            const response = await fetch(`/teacher/${teacher._id}/wearable-category`, {
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
        if (!viewingAsTeacher) return;
        e.preventDefault();
        let content = (
            <ul className="editDelete">
                <li><button onClick={(e) => addOrEditCategory(e, categoryName)}>Edit</button></li>
            </ul>
        );
        props.updateContextMenu(e, content);
    }
    const studentOperations = {
        buyWearable: ({ _id, name, src, value }) => {
            if (viewingAsTeacher) return;
            const handleSubmit = async (e) => {
                e.preventDefault();
                if (student.coins < value) {
                    let cantAfford = (
                        <div className="modalBox">
                            <h2>Not enough coins</h2>
                            You don't have enough coins to purchase this item. It costs {value} and you only have {student.coins}.
                            <div className="buttons">
                                <button type="button" onClick={() => props.updateModal(false)}>OK</button>
                            </div>
                        </div>
                    );
                    props.updateModal(cantAfford);
                    return;
                }
                props.updateModal(content({ loadingIcon: true }));
                const response = await fetch(`/student/${student._id}/closet`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        wearableId: _id,
                        wearableCost: value
                    })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success response from server');
                props.refreshData();
                props.updateModal(false);
            }
            let content = (options = {
                loadingIcon: false
            }) => (
                <div className="modalBox">
                    <h2>Confirm purchase</h2>
                    <img alt={name} src={src} style={{ float: 'right' }} />
                    Are you sure you want to purchase <b>{name}</b> for <b>{value}</b>?
                    <div className="buttons">
                    {options.loadingIcon
                        ?   <Loading />
                        :   <form onSubmit={handleSubmit}>
                                <button type="submit">Yes, I'm sure</button>
                                <button type="button" className="greyed" onClick={() => props.updateModal(false)}>Cancel</button>
                            </form>
                        }
                    </div>
                </div>
            );
            props.updateModal(content());
        }
    }
    const generate = {
        previewObject: (preview) => {
            const images = [];
            for (let category in preview) {
                images.push(<img key={`marketplacePreview-${category}`} src={preview[category].src} className={category} />);
            }
            return <div className="previewBox">{images}</div>;
        },
        previewDescription: (preview) => {
            if (viewingAsTeacher) return;
            const previewItems = [];
            for (let category in preview) {
                previewItems.push(
                    <li key={`marketplacePreviewDescription-${category}`}>
                        <span className="wearableName">{preview[category].name}</span>
                        {!viewingAsTeacher && student.closet.includes(preview[category]._id)
                            ?   <span className="owned"></span>
                            :   <button onClick={() => studentOperations.buyWearable(preview[category])}>
                                    <img className="coin" alt="coin icon" src="assets/Coin_ico.png" />
                                    <span className="wearableValue">{preview[category].value}</span>
                                </button>
                            }
                    </li>
                )
            }
            return (
                <ul className="previewDescription">
                    <h3>Trying On:</h3>
                    {previewItems}
                </ul>
            );
        },
        categoriesList: (categories) => {
            const array = categories.map(category => (
                <button
                  key={`wearableCategories-toolbar-${category}`}
                  className="stealth"
                  onClick={() => setCategory(category)}
                  onContextMenu={(e) => editCategory(e, category)}>
                    {category}
                </button>
            ))
            if (viewingAsTeacher) array.push(
                <button key="wearableCategories-toolbar-addNew" className="add" onClick={addOrEditCategory}></button>
            );
            return array;
        },
        wearablesList: (category) => {
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
    }
    return (
        <div className="Marketplace">
            <div className="marketplacePreview">
                {generate.previewObject(preview)}
                {generate.previewDescription(preview)}
            </div>
            <div className="marketplaceCategories">
                {generate.categoriesList(teacher.wearableCategories)}
            </div>
            <div className="marketplaceWearables">
                <div className="wearablesGrid">
                    {generate.wearablesList(category)}
                </div>
            </div>
        </div>
    );
}

export function AddOrEditWearable(props) {
    const { teacher, wearable } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [formData, setFormData] = useState({
        teacherCode: wearable ? wearable.teacherCode : teacher._id,
        name: wearable ? wearable.name : '',
        category: wearable ? wearable.category : teacher.wearableCategories[0],
        src: wearable ? wearable.src : '',
        value: wearable ? wearable.value : '',
        image: {
            w: wearable ? wearable.image.w : 50,
            x: wearable ? wearable.image.x : 10,
            y: wearable ? wearable.image.y : 40
        }
    });
    const updateFormData = (key, value) => {
        setFormData(prevState => ({
            ...prevState,
            [key]: value
        }));
    }
    const updateImage = (newStuff) => {
        setFormData(prevState => ({
            ...prevState,
            image: {
                ...prevState.image,
                ...newStuff
            }
        }));
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingIcon(true);
        const ROUTE = wearable ? `/wearable/${wearable._id}` : '/wearable';
        const response = await fetch(ROUTE, {
            method: wearable ? 'PUT' : 'POST',
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
        const response = await fetch(`/teacher/${teacher._id}/wearable-category`, {
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
        return listItems;
    }
    return (
        <div className="modalBox">
            <h2>Add new wearable</h2>
            <form className="pad" onSubmit={handleSubmit}>
                <div className="addWearableForm">
                    <div>
                        <label htmlFor="name">Wearable name:</label>
                        <input
                            type="text"
                            defaultValue={wearable ? wearable.name : ''}
                            onChange={(e) => updateFormData('name', e.target.value)} />
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
                    </div>
                    <AddOrEditWearablePreview src={formData.src} image={formData.image} updateImage={updateImage} />
                </div>
                <div className="buttons">
                    {loadingIcon
                        ? <Loading />
                        : <input type="submit" />
                    }
                </div>
            </form>
        </div>
    );
}

function AddOrEditWearablePreview(props) {
    const { src, image } = props;
    const [mouseIsDown, setMouseIsDown] = useState(false);
    const [mouseIsMoving, setMouseIsMoving] = useState(false);
    const [elementPosition, setElementPosition] = useState({
        x: 0,
        y: 0
    });
    const [elementOffset, setElementOffset] = useState(null);
    const preview = useRef(null);
    const draggable = useRef(null);
    useEffect(() => {
        const draggableObject = draggable.current;
        const previewBox = preview.current;
        if (!draggableObject || !previewBox) return;
        setElementPosition({
            x: (image.x * previewBox.scrollWidth) / 100,
            y: (image.y * previewBox.scrollHeight) / 100
        });
        const mouseup = () => setMouseIsDown(false);
        const mousedown = (e) => {
            setMouseIsDown(e);
            window.addEventListener('mouseup', mouseup);
        }
        draggableObject.addEventListener('mousedown', mousedown);
        return () => {
            draggableObject.removeEventListener('mousedown', mousedown);
            window.removeEventListener('mouseup', mouseup);
        }
    }, []);
    useEffect(() => {
        const previewBox = preview.current;
        const mousemove = (e) => {
            e.preventDefault();
            setMouseIsMoving(e);
        }
        if (!mouseIsDown) {
            setMouseIsDown(false);
            setMouseIsMoving(false);
            const calculateImageCoords = () => ({
                x: (elementPosition.x * 100) / previewBox.scrollWidth,
                y: (elementPosition.y * 100) / previewBox.scrollHeight
            });
            props.updateImage(calculateImageCoords());
            previewBox.removeEventListener('mousemove', mousemove);
            return;
        }
        const e = mouseIsDown;
        const calculateElementOffset = (e) => {
            const mouseX = e.clientX - previewBox.getBoundingClientRect().left;
            const mouseY = e.clientY - previewBox.getBoundingClientRect().top;
            const offsetX = mouseX - elementPosition.x;
            const offsetY = mouseY - elementPosition.y;
            setElementOffset({
                x: offsetX,
                y: offsetY
            });
        }
        calculateElementOffset(e);
        previewBox.addEventListener('mousemove', mousemove);
        return () => previewBox.removeEventListener('mousemove', mousemove);
    }, [mouseIsDown]);
    useEffect(() => {
        if (!mouseIsMoving) return;
        const previewBox = preview.current;
        const e = mouseIsMoving;
        const mouseX = e.clientX - previewBox.getBoundingClientRect().left;
        const mouseY = e.clientY - previewBox.getBoundingClientRect().top;
        setElementPosition({
            x: mouseX - elementOffset.x,
            y: mouseY - elementOffset.y
        });
    }, [mouseIsMoving, elementOffset]);
    return (
        <div>
            <label>Preview:</label>
            <div className="previewBox" ref={preview}>
                <img
                  alt="preview"
                  src={src}
                  ref={draggable}
                  className="draggable"
                  style={{
                    transform: `translate3d(${elementPosition.x}px, ${elementPosition.y}px, 0)`
                }} />
            </div>
        </div>
    );
}