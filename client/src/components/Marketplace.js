import { useState, useEffect, useRef } from 'react';
import Loading from './Loading';
import { shrinkit } from '../utils';
import Dropdown from './Dropdown';
import PianopetBase from './PianopetBase';
import Splat from './Splat';
import { ntc } from '../utils/ntc';

export default function Marketplace(props) {
    const { viewingAsTeacher, student, avatar, teacher, wearables, categories, isMobile } = props;
    const [preview, setPreview] = useState(null);
    const [category, setCategory] = useState(() => categories[0]);
    const wearableRefs = useRef({});
    useEffect(() => {
        if (avatar) setPreview(avatar);
        else setPreview({});
    }, [avatar]);
    useEffect(() => {
        // this useEffect is for when the teacher is editing a wearable (e.g. updating image source/coords, color hex) while previewing that
        // same wearable in the preview box - when 'wearables' array is refetched after submit, we loop through the preview object and update it
        // with the most recent information
        const previewIsEmpty = !preview || (preview && Object.keys(preview).length === 0);
        if (!viewingAsTeacher || previewIsEmpty) return;
        const updatedPreviewObject = (preview) => {
            const updatedObject = {};
            for (let categoryName in preview) {
                const wearableId = preview[categoryName]._id;
                const getWearableObjectFromId = (id) => {
                    const wearable = wearables.find(item => item._id === id);
                    return wearable;
                }
                const wearable = getWearableObjectFromId(wearableId);
                const category = getCategoryObject.fromId(wearable.category);
                const { _id, name, src, value, image } = getWearableObjectFromId(wearableId)
                updatedObject[category.name] = { _id, name, src, value, image };
            }
            return updatedObject;
        }
        setPreview(prevState => updatedPreviewObject(prevState));
    }, [wearables]);
    const getCategoryObject = {
        fromName: (name) => categories.find(item => item.name === name),
        fromId: (id) => categories.find(item => item._id === id)
    }
    const updatePreview = ({ category, _id, name, src, value, image }) => {
        const updatePreviewFor = (type) => {
            const categoryName = getCategoryObject.fromId(category)?.name || category; // in case of default
            const [object, setObject] = type === 'preview'
                ? [preview, setPreview]
                : [avatar, props.updateAvatar];
            if (object?.[categoryName]?.name === name) {
                const previewObjectMinusCategory = (prevState) => {
                    const obj = {...prevState};
                    delete obj[categoryName];
                    return obj;
                }
                setObject(prevState => ({
                    ...previewObjectMinusCategory(prevState)
                }));
                return;
            }
            setObject(prevState => ({
                ...prevState,
                [categoryName]: { _id, name, src, value, image }
            }));
        }
        if (isMobile) updatePreviewFor('avatar');
        else updatePreviewFor('preview');
    }
    const teacherOperations = {
        addColor: () => {
            const content = (<AddOrEditColor {...props} category={getCategoryObject.fromName('Color')} />);
            props.updateModal(content);
        },
        editOrDeleteWearable: (e, _id, type) => {
            e.preventDefault();
            if (!viewingAsTeacher) return;
            const index = wearables.findIndex(wearable => wearable._id === _id);
            const thisWearable = wearables[index];
            const dialog = type === 'color'
                ? <AddOrEditColor {...props} wearable={thisWearable} category={getCategoryObject.fromName('Color')} />
                : <AddOrEditWearable {...props} wearable={thisWearable} category={getCategoryObject.fromId(thisWearable.category)} />;
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
                            Are you sure you want to delete the {type === 'color' ? 'color' : 'wearable'} "{thisWearable.name}"? This action cannot be undone.
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
                            {type === 'color'
                                ? <Splat color={thisWearable.src} />
                                : <img alt={thisWearable.name} src={thisWearable.src} />}
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
        addOrEditCategory: (e, category) => {
            e.preventDefault();
            if (!viewingAsTeacher) return;
            const originalName = category?.name;
            const editingCategory = !!category;
            const handleAddOrEditCategory = async (e, categoryName) => {
                e.preventDefault();
                props.updateModal(content({ loadingIcon: true }));
                const fromDropdown = !!categoryName;
                const formData = editingCategory
                    ?   {
                            _id: category._id,
                            categoryName: e.target[0].value
                        }
                    :   { categoryName: fromDropdown ? categoryName : e.target[0].value }
                const response = await fetch(`/teacher/${teacher._id}/wearable-category`, {
                    method: editingCategory ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                const body = await response.json();
                console.dir(body);
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success response from server');
                props.refreshData();
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
        confirmDeleteCategory: (category) => {
            // check if empty
            let content;
            const handleDelete = async (e, reassignWearables = false) => {
                e.preventDefault();
                props.updateModal(content({ loadingIcon: true }));
                const response = await fetch(`/teacher/${teacher._id}/wearable-category`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        _id: category._id,
                        reassignWearables
                    })
                });
                const body = await response.json();
                if (!body) return console.log('no response from server');
                if (!body.success) return console.log('no success response from server');
                //todo shrink it down in the list before it disappears
                props.refreshData();
                props.updateModal(false);
            }
            const categoryIsEmpty = (() => !wearables.some(wearable => wearable.category === category._id))();
            if (categoryIsEmpty) content = (options = {
                loadingIcon: false
            }) => (
                <div className="modalBox">
                    <h2>Delete this category</h2>
                    Are you sure you want to delete the category "{category.name}"?
                    {options.loadingIcon
                        ?   <Loading />
                        :   <form className="buttons" onSubmit={handleDelete}>
                                <button type="submit">Yes, I'm sure</button>
                                <button type="button" className="greyed" onClick={() => props.updateModal(false)}>Cancel</button>
                            </form>
                        }
                </div>
            );
            else content = () => <div>you need to move the contents to a different category then</div>;
            props.updateModal(content());
        },
        editOrDeleteCategory: (e, category) => {
            if (!viewingAsTeacher) return;
            e.preventDefault();
            let content = (
                <ul className="editDelete">
                    <li><button onClick={(e) => teacherOperations.addOrEditCategory(e, category)}>Edit</button></li>
                    <li><button onClick={(e) => teacherOperations.confirmDeleteCategory(category)}>Delete</button></li>
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
                            alt={thisWearable.name}
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
                    {preview && <PianopetBase color={preview?.Color?.src} />}
                    {images}
                </div>
            );
        },
        previewDescription: (preview) => {
            if (viewingAsTeacher || isMobile) return;
            const previewItems = [];
            for (let category in preview) {
                if (!preview[category]._id) break; // default color _id is undefined
                const isOwned = student.closet.includes(preview[category]._id);
                previewItems.push(
                    <li key={`marketplacePreviewDescription-${category}`}>
                        <span className="wearableName">{preview[category].name}</span>
                        {!viewingAsTeacher && isOwned
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
                  key={`wearableCategories-toolbar-${category.name}`}
                  onClick={() => setCategory(category)}
                  onContextMenu={(e) => teacherOperations.editOrDeleteCategory(e, category)}>
                    {category.name}
                </button>
            ))
            if (viewingAsTeacher) array.push(
                <button key="wearableCategories-toolbar-addNew" className="add" onClick={teacherOperations.addOrEditCategory}></button>
            );
            return array;
        },
        wearablesList: (category) => {
            const filteredList = wearables.filter(wearable => wearable.category === category._id);
            const list = filteredList.map(wearable => {
                const ownsWearable = (() => {
                    if (viewingAsTeacher) return false;
                    if (student.closet.includes(wearable._id)) return true;
                    return false;
                })();
                const type = category.name === 'Color' ? 'color' : 'wearable';
                return (
                    <button
                      ref={(el) => wearableRefs.current[wearable._id] = el}
                      key={`${category.name}-wearable-${wearable.name}`}
                      className={ownsWearable ? 'owned' : ''}
                      onClick={() => updatePreview(wearable)}
                      onContextMenu={(e) => teacherOperations.editOrDeleteWearable(e, wearable._id, type)}>
                        {category.name === 'Color'
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
            if (viewingAsTeacher && category.name === 'Color') list.push(
                <button key="color-wearable-addNew" className="add" onClick={teacherOperations.addColor}></button>
            );
            if (category.name === 'Color') list.splice(0, 0, (
                <button
                    ref={(el) => wearableRefs.current['default'] = el}
                    key={`Color-wearable-defaultColor`}
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
                {generate.categoriesList(categories)}
            </div>
            <div className="wearablesList">
                <div className={category?.name === 'Color' ? 'blobs' : null}>
                    {generate.wearablesList(category)}
                </div>
            </div>
        </div>
    );
}

function AddOrEditColor(props) {
    const { teacher, wearable, category } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [formData, setFormData] = useState({
        teacherCode: teacher._id,
        name: wearable ? wearable.name : '',
        category: category._id,
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
    const { teacher, wearable, category, categories } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [formData, setFormData] = useState({
        teacherCode: wearable ? wearable.teacherCode : teacher._id,
        name: wearable ? wearable.name : '',
        category: wearable ? category._id : categories[0]._id,
        src: wearable ? wearable.src : '',
        value: wearable ? wearable.value : '',
        image: {
            w: wearable?.image ? wearable.image.w : 50,
            x: wearable?.image ? wearable.image.x : 10,
            y: wearable?.image ? wearable.image.y : 40
        }
    });
    useEffect(() => {
        console.dir(formData);
    }, [])
    const [categoriesList, setCategoriesList] = useState(() => {
        return categories.map(item => ({
            value: item._id,
            display: item.name
        }));
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
        // if added new category via dropdown, need to set formData.category to new category ID bc right now it's set to category name!!!!
        // refreshData() from addCategory() has already been called but updated 'categories' array isn't available here because we're inside the
        // modal and the state is set... god dammit... ok temporary workaround
        // first check if formData.category is among existing categories, in which case we can skip this whole charade
        // if it is a new category, then find it by name (display) in the categoriesList array [{ value, display }] and replace it with its _id
        let dataToSend = formData;
        const isExistingCategory = (() => {
            const index = categories.findIndex(item => item._id === formData.category);
            return index !== -1;
        })();
        console.dir(formData);
        if (!isExistingCategory) {
            const isValidCategory = (() => {
                const obj = categoriesList.find(item => item.display === formData.category);
                return obj; // can't imagine this would return undefined but just in case
            })();
            if (!isValidCategory) return;
            let newCategory = isValidCategory;
            dataToSend = {
                ...formData,
                category: newCategory.value
            }
        }
        // by the way another reason we need a separate categoriesList array is to update the actual dropdown with the new option added
        // since we're inside modal and the state of 'modal', all the way up in App.js, is set to this until updateModal() is called again
        // what a fucking pain
        // todo fix this shit
        const ROUTE = wearable ? `/wearable/${wearable._id}` : '/wearable';
        const response = await fetch(ROUTE, {
            method: wearable ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        const body = await response.json();
        if (!body.success) return console.error(body.error);
        props.updateModal(false);
        props.refreshData();
    }
    const addCategory = async (categoryName) => {
        // this is happening first, then formData gets updated
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
        const { _id, name } = body.newCategory;
        setCategoriesList(prevState => {
            prevState.push({ value: _id, display: name });
            return prevState;
        });
        props.refreshData();
    }
    const dropdownItems = {
        defaultValue: () => {
            const categoryName = wearable ? category.name : categories[0].name;
            const categoryId = wearable ? category._id : categories[0]._id;
            return {
                value: categoryId,
                display: categoryName
            }
        },
        listItems: categoriesList
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
                            defaultValue={dropdownItems.defaultValue()}
                            listItems={dropdownItems.listItems}
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
    const [mouseIsDown, setMouseIsDown] = useState(null);
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
    // eslint-disable-next-line
    }, []); // want this to run ONLY when the function mounts, not if/when image.x and image.y change (which they will)
    useEffect(() => {
        const previewBox = preview.current;
        const mousemove = (e) => {
            e.preventDefault();
            setMouseIsMoving(e);
        }
        if (mouseIsDown === null) return;  // do not want this firing on first render otherwise image coords get set to 0, 0!
        if (!mouseIsDown) {
            setMouseIsMoving(false);
            const calculateImageCoords = () => ({
                x: (elementPosition.x * 100) / previewBox.scrollWidth,
                y: (elementPosition.y * 100) / previewBox.scrollHeight
            });
            props.updateImage(calculateImageCoords());
            previewBox.removeEventListener('mousemove', mousemove);
            return;
        }
        const e = mouseIsDown; // mouseIsDown will have been set to the actual DOM mousedown event
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
    // eslint-disable-next-line
    }, [mouseIsDown]); // todo double check eslint disable
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

function DeleteWearableCategory(props) {
    const { category, categories, teacher } = props; // props.handleDelete
    const [formData, setFormData] = useState({});
    const [categoriesList, setCategoriesList] = useState(() => {
        const array = categories.filter(item => item._id !== category._id);
        return array.map(item => ({
            value: item._id,
            display: item.name
        }));
    });
    const updateFormData = (key, value) => {
        setFormData(prevState => ({
            ...prevState,
            [key]: value
        }));
    }
    const dropdownItems = {
        defaultValue: categoriesList[0],
        listItems: categoriesList
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
        const { _id, name } = body.newCategory;
        setCategoriesList(prevState => {
            prevState.push({ value: _id, display: name });
            return prevState;
        });
        props.refreshData();
    }
    return (
        <div className="modalBox">
            <h2>Delete category</h2>
            The category "{category.name}" contains X number of wearables. If you want to delete it, you need to move them to a different category.
            <div>
                <label>Select a category:</label>
                <Dropdown
                    minWidth="10rem"
                    defaultValue={dropdownItems.defaultValue}
                    listItems={dropdownItems.listItems}
                    addNew={addCategory}
                    onChange={(value) => updateFormData('category', value)} />
            </div>
        </div>
    )
}