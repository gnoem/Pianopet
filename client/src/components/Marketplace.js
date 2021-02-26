import { useState, useEffect, useRef } from 'react';
import Loading from './Loading';
import { shrinkit } from '../utils';
import Dropdown from './Dropdown';
import PianopetBase from './PianopetBase';
import Splat from './Splat';
import { ntc } from '../utils/ntc';

export default function Marketplace(props) {
    const { viewingAsTeacher, student, avatar, teacher, wearables, isMobile } = props;
    const [preview, setPreview] = useState(null);
    const [category, setCategory] = useState(() => teacher.wearableCategories[0]);
    const wearableRefs = useRef({});
    useEffect(() => {
        setPreview(avatar);
    }, [avatar]);
    const updatePreview = ({ category, _id, name, src, value, image }) => {
        const updatePreviewFor = (object) => {
            let setObject;
            if (object === 'preview') setObject = setPreview;
            if (object === 'avatar') setObject = props.updateAvatar;
            if (object[category] && object[category].name === name) {
                const previewObjectMinusCategory = (prevState) => {
                    const object = {...prevState};
                    delete object[category];
                    return object;
                }
                setObject(prevState => ({
                    ...previewObjectMinusCategory(prevState)
                }));
                return;
            }
            setObject(prevState => ({
                ...prevState,
                [category]: { _id, name, src, value, image }
            }));
        }
        if (isMobile) updatePreviewFor('avatar');
        else updatePreviewFor('preview');
    }
    const teacherOperations = {
        addColor: () => {
            const content = (<AddOrEditColor {...props} />);
            props.updateModal(content);
        },
        editOrDeleteWearable: (e, _id, type) => {
            e.preventDefault();
            if (!viewingAsTeacher) return;
            const index = wearables.findIndex(wearable => wearable._id === _id);
            const thisWearable = wearables[index];
            const dialog = type === 'color'
                ? <AddOrEditColor {...props} wearable={thisWearable} />
                : <AddOrEditWearable {...props} wearable={thisWearable} />;
            const editWearable = () => props.updateModal(dialog);
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
                    <div className="modalBox hasImage">
                        <div>
                            <h2>Are you sure?</h2>
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
                        <div className="flex center">
                            <img alt={thisWearable.name} src={thisWearable.src} />
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
        },
        addOrEditCategory: (e, originalName) => {
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
            if (originalName === 'Color') content = (
                <div className="modalBox">
                    <h2>Not allowed</h2>
                    Sorry, this is a default category and can't be renamed.
                    <div className="buttons"><button onClick={() => props.updateModal(false)}>Go back</button></div>
                </div>
            )
            props.updateModal(content);
        },
        editCategory: (e, categoryName) => {
            if (!viewingAsTeacher) return;
            e.preventDefault();
            let content = (
                <ul className="editDelete">
                    <li><button onClick={(e) => teacherOperations.addOrEditCategory(e, categoryName)}>Edit</button></li>
                </ul>
            );
            props.updateContextMenu(e, content);
        }
    }
    const studentOperations = {
        buyWearable: ({ _id, name, src, value, image }) => {
            if (viewingAsTeacher) return;
            const buyingColor = !image;
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
                <div className="modalBox hasImage">
                    <div>
                        <h2>Confirm purchase</h2>
                        Are you sure you want to purchase {buyingColor && 'the color'} <b>{name}</b> for <span className="coins"><b>{value}</b>?</span>
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
                    <div className="flex center">
                        {buyingColor
                            ? <PianopetBase color={src} zoom={true} />
                            : <img alt={name} src={src} />
                        }
                    </div>
                </div>
            );
            props.updateModal(content());
        }
    }
    const generate = {
        previewObject: (preview) => {
            if (isMobile) return null;
            const images = [];
            for (let category in preview) {
                if (category !== 'Color') {
                    const thisWearable = preview[category];
                    const style = {
                        top: `${thisWearable.image.y}%`,
                        left: `${thisWearable.image.x}%`,
                        width: `${thisWearable.image.w}%`
                    }
                    images.push(
                        <img
                          key={`marketplacePreview-${category}`}
                          className={`previewWearable ${category}`}
                          src={thisWearable.src}
                          style={style}
                        />
                    );
                }
            }
            return (
                <div className="previewBox">
                    <PianopetBase color={preview?.Color?.src} />
                    {images}
                </div>
            );
        },
        previewDescription: (preview) => {
            if (viewingAsTeacher || isMobile) return;
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
                <ul>
                    <h3>Previewing:</h3>
                    {previewItems}
                </ul>
            );
        },
        categoriesList: (categories) => {
            const array = categories.map(category => (
                <button
                  key={`wearableCategories-toolbar-${category}`}
                  onClick={() => setCategory(category)}
                  onContextMenu={(e) => teacherOperations.editCategory(e, category)}>
                    {category}
                </button>
            ))
            if (viewingAsTeacher) array.push(
                <button key="wearableCategories-toolbar-addNew" className="add" onClick={teacherOperations.addOrEditCategory}></button>
            );
            return array;
        },
        wearablesList: (category) => {
            const filteredList = wearables.filter(wearable => wearable.category === category);
            const list = filteredList.map(wearable => {
                const ownsWearable = (() => {
                    if (viewingAsTeacher) return false;
                    if (student.closet.includes(wearable._id)) return true;
                    return false;
                })();
                const type = category === 'Color' ? 'color' : 'wearable';
                return (
                    <button
                      ref={(el) => wearableRefs.current[wearable._id] = el}
                      key={`${category}-wearable-${wearable.name}`}
                      className={ownsWearable ? 'owned' : ''}
                      onClick={() => updatePreview(wearable)}
                      onContextMenu={(e) => teacherOperations.editOrDeleteWearable(e, wearable._id, type)}>
                        {wearable.category === 'Color'
                            ? <Splat color={wearable.src} />
                            : <img alt={wearable.name} src={wearable.src} />}
                        <span>{wearable.name}</span>
                        <span>
                            <img alt="coin icon" src="assets/Coin_ico.png" />
                            <span>{wearable.value}</span>
                        </span>
                    </button>
                )
            });
            if (viewingAsTeacher && category === 'Color') list.push(
                <button key="color-wearable-addNew" className="add" onClick={teacherOperations.addColor}></button>
            );
            if (category === 'Color') list.splice(0, 0, (
                <button
                    ref={(el) => wearableRefs.current['default'] = el}
                    key={`${category}-wearable-defaultColor`}
                    className={viewingAsTeacher ? null : "owned"}
                    onClick={() => updatePreview({ category: 'Color', src: '#5C76AE' })}>
                    <Splat color="#5C76AE" />
                    <span>Default</span>
                    <span>
                        <img alt="coin icon" src="assets/Coin_ico.png" />
                        <span>0</span>
                    </span>
                </button>
            ));
            return list;
        }
    }
    return (
        <div className="Marketplace">
            <div className="marketplacePreview">
                {generate.previewObject(preview)}
                {generate.previewDescription(preview)}
            </div>
            <div className="wearableCategories">
                {generate.categoriesList(teacher.wearableCategories)}
            </div>
            <div className="wearablesList">
                <div className={category === 'Color' ? 'blobs' : null}>
                    {generate.wearablesList(category)}
                </div>
            </div>
        </div>
    );
}

function AddOrEditColor(props) {
    const { teacher, wearable } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [formData, setFormData] = useState({
        teacherCode: teacher._id,
        name: wearable ? wearable.name : '',
        category: 'Color',
        src: wearable ? wearable.src : '#' + Math.floor(Math.random()*16777215).toString(16),
        value: wearable ? wearable.value : ''
    });
    const colorInput = useRef(null);
    const addingColor = !wearable;
    const updateFormData = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
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
    return (
        <div className="modalBox">
            <form onSubmit={handleSubmit} autoComplete="off">
                <h2>{addingColor ? 'Add a new' : 'Edit this'} color</h2>
                {addingColor ? 'Add a new' : 'Edit this'} color by clicking on the Pianopet icon below.
                <div className="colorPicker">
                    <div>
                        <PianopetBase color={formData.src} zoom={true} />
                        <input name="src" type="color" defaultValue={formData.src} onChange={updateFormData} ref={colorInput} />
                        <span onClick={() => colorInput.current.click()}></span>
                    </div>
                    <div>
                        <label htmlFor="name">Color name:</label>
                        <input
                            name="name"
                            type="text"
                            placeholder={`How about ${ntc.name(formData.src)[1]}?`}
                            defaultValue={formData.name}
                            onChange={updateFormData} />
                    </div>
                    <div>
                        <label htmlFor="value">Cost:</label>
                        <input name="value" type="text" defaultValue={formData.value} onChange={updateFormData} />
                    </div>
                </div>
                {addingColor || <div className="tip" style={{ marginTop: '1rem' }}>Tip: Clear the text box to see color name suggestions!</div>}
                {loadingIcon
                    ?   <Loading />
                    :   <div className="buttons">
                            <button type="submit">Submit</button>
                            <button type="button" className="greyed" onClick={() => props.updateModal(false)}>Cancel</button>
                        </div>
                    }
            </form>
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
            w: wearable && wearable.image ? wearable.image.w : 50,
            x: wearable && wearable.image ? wearable.image.x : 10,
            y: wearable && wearable.image ? wearable.image.y : 40
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
    const updateImageSize = (e) => {
        e.preventDefault();
        const percentage = parseInt(e.target.value) + 1;
        const draggableObject = draggable.current;
        draggableObject.style.width = percentage + '%';
        props.updateImage({ w: percentage });
    }
    return (
        <div>
            <label>Preview:</label>
            <div className="previewBox">
                <div ref={preview}>
                    <PianopetBase />
                    <img
                    alt="preview"
                    src={src}
                    ref={draggable}
                    className={`draggable${mouseIsDown ? ' dragging' : ''}`}
                    style={{
                        width: image.w + '%',
                        transform: `translate3d(${elementPosition.x}px, ${elementPosition.y}px, 0)`
                        }} />
                </div>
            </div>
            <input type="range" defaultValue={image.w - 1} min="0" max="99" onChange={updateImageSize} />
        </div>
    );
}