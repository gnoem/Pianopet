import { useState, useEffect, useRef, useContext } from "react";
import { Category } from "../../../api";
import { DataContext } from "../../../contexts";
import { useFormData } from "../../../hooks";
import { handleError } from "../../../services";
import { Input, InputDropdown, Checkbox, Submit } from "../../Form";
import { ModalForm } from "..";
import { PianopetBase } from "../../Avatar/PianopetBase";
import { WearableOptions } from "./utils";

export const ManageWearable = ({ user: teacher, wearable, cancel, addingNew, formHandle, formError, createModal, refreshData }) => {
    const { handleSubmit, handleSuccess } = formHandle;
    const { updateFormError, resetFormError, warnFormError } = formError;
    const { categories } = useContext(DataContext);
    const filteredCategories = categories.filter(item => item.name !== 'Color' && item.name !== 'Wallpaper');
    const [formData, updateFormData, setFormDataDirectly] = useFormData({
        teacherCode: wearable?.teacherCode ?? teacher._id,
        name: wearable?.name ?? '',
        category: wearable?.category ?? filteredCategories[0]?._id,
        src: wearable?.src ?? '',
        value: wearable?.value ?? '',
        occupies: wearable?.occupies ?? [],
        active: wearable?.active ?? true,
        flag: wearable?.flag ?? addingNew,
        image: {
            w: wearable?.image?.w ?? 50,
            x: wearable?.image?.x ?? 10,
            y: wearable?.image?.y ?? 40
        }
    });
    return (
        <ModalForm onSubmit={() => handleSubmit(formData)} handleSuccess={handleSuccess} handleFormError={updateFormError}
                   title={addingNew ? 'Add new wearable' : 'Edit this wearable'}
                   submit={addingNew ? <Submit nvm="Back" cancel={cancel} /> : <Submit value="Save changes" />}>
            <div className="wearableForm">
                <div>
                    <Input
                        type="text"
                        name="name"
                        label="Wearable name:"
                        defaultValue={formData?.name}
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('name')} />
                    <WearableCategoryInput {...{
                        addingNew,
                        wearable,
                        teacher,
                        setFormDataDirectly,
                        filteredCategories,
                        createModal,
                        refreshData
                    }} />
                    {filteredCategories.length > 1 && (
                        <OccupiedRegionsInput {...{
                            wearable,
                            formData,
                            setFormDataDirectly,
                            filteredCategories
                        }} />
                    )}
                    <Input
                        type="text"
                        name="src"
                        label="Image link:"
                        defaultValue={formData?.src}
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('src')} />
                    <Input
                        type="number"
                        name="value"
                        label="Wearable value:"
                        defaultValue={formData?.value}
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('value')} />
                </div>
                <div>
                    <ManageWearableImage {...{ formData, setFormDataDirectly }} />
                    <WearableOptions {...{ formData, setFormDataDirectly }} />
                </div>
            </div>
        </ModalForm>
    );
}

const WearableCategoryInput = ({ addingNew, wearable, teacher, setFormDataDirectly, filteredCategories, createModal, refreshData }) => {
    const updateCategoryFormData = (value) => {
        setFormDataDirectly(prevState => ({ ...prevState, category: value }));
    }
    const categoryDropdown = {
        defaultValue: () => {
            const listItems = categoryDropdown.listItems();
            if (addingNew) return listItems[0];
            const index = listItems.findIndex(item => item.value === wearable?.category);
            if (index === -1) return listItems[0];
            return listItems[index];
        },
        listItems: () => {
            return filteredCategories.map(category => ({
                value: category._id,
                display: category.name
            }));
        }
    }
    const addNewCategory = (name) => {
        const onSuccess = ({ category }) => {
            refreshData();
            updateCategoryFormData(category._id);
            return category.name;
        }
        return Category.createCategory({ teacherCode: teacher._id, name })
            .then(onSuccess)
            .catch(err => {
                const { error } = err;
                const handleFormError = error ? () => {} : null; // if form/validation error is undefined, should trigger createModal fallback
                handleError(err, { handleFormError, createModal });
                throw error.name; // ('name' is referring to category name input in error object, e.g. { error: { name: 'this field is required' } })
            });
    }
    return (
        <InputDropdown
            name="category"
            label="Wearable category:"
            defaultValue={categoryDropdown.defaultValue()}
            listItems={categoryDropdown.listItems()}
            onChange={updateCategoryFormData}
            addNew={addNewCategory} // NOTE: validation errors for "addNew" are handled inside dropdown component
            style={{ minWidth: '10rem' }} />
    );
}

const OccupiedRegionsInput = ({ wearable, formData, setFormDataDirectly, filteredCategories }) => {
    const occupiesRegionsInput = () => {
        const additionalCategories = filteredCategories.filter(item => item._id !== formData.category);
        const updateOccupies = (e, category) => {
            const updatedArray = (prevArray) => {
                const arrayToReturn = [...prevArray];
                if (e.target.checked) {
                    const alreadyInArray = arrayToReturn.includes(category);
                    if (!alreadyInArray) arrayToReturn.push(category);
                    return arrayToReturn;
                } else {
                    const index = arrayToReturn.indexOf(category);
                    if (index !== -1) arrayToReturn.splice(index, 1);
                    return arrayToReturn;
                }
            }
            setFormDataDirectly(prevState => ({
                ...prevState,
                occupies: updatedArray(prevState.occupies)
            }));
        }
        return additionalCategories.map(category => (
            <OccupiedRegionsCheckbox
                key={`occupiedRegionsInput-${category._id}`}
                {...{ category, wearable, formData, updateOccupies }} />
        ));
    }
    return (
        <div className="Input">
            <label htmlFor="occupies">Occupies regions:</label>
            <div className="checkboxContainer">
                {occupiesRegionsInput()}
            </div>
        </div>
    );
}

const OccupiedRegionsCheckbox = ({ category, wearable, formData, updateOccupies }) => {
    const isChecked = () => {
        if (wearable?.occupies.includes(category._id)) return true;
        if (formData.occupies.includes(category._id)) return true;
        return false;
    }
    return (
        <Checkbox
            key={`occupiesRegions-checkbox-${category._id}`}
            label={category.name}
            checked={isChecked()}
            onChange={(e) => updateOccupies(e, category._id)}
        />
    );
}

const ManageWearableImage = ({ formData, setFormDataDirectly }) => {
    const { src, image } = formData;
    const preview = useRef(null);
    const draggable = useRef(null);
    const [mouseIsDown, setMouseIsDown] = useState(null);
    const [mouseIsMoving, setMouseIsMoving] = useState(false);
    const [elementPosition, setElementPosition] = useState({
        x: 0,
        y: 0
    });
    const [elementOffset, setElementOffset] = useState(null);
    const updateImage = (newStuff) => {
        setFormDataDirectly(prevState => ({
            ...prevState,
            image: {
                ...prevState.image,
                ...newStuff
            }
        }));
    }
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
            updateImage(calculateImageCoords());
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
        updateImage({ w: percentage });
    }
    return (
        <div className="wearableImage">
            <label>Preview:</label>
            <div className="previewBox">
                <div ref={preview}>
                    <PianopetBase />
                    <img
                        alt=""
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