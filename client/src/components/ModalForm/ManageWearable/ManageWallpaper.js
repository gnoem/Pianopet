import { useEffect, useState } from "react";
import { useFormData } from "../../../hooks";
import { Input, InputDropdown, Submit } from "../../Form";
import { ModalForm } from "..";
import { PianopetBase } from "../../Avatar/PianopetBase";
import { PianopetWallpaper } from "../../Avatar/PianopetWallpaper";
import { WearableOptions } from "./utils";

export const ManageWallpaper = ({ user: teacher, wearable, cancel, addingNew, formHandle, formError }) => {
    const { handleSubmit, handleSuccess } = formHandle;
    const { updateFormError, resetFormError, warnFormError } = formError;
    const getDefault = {
        color: (() => {
            if (wearable?.image?.type === 'color') return wearable.src;
            return '#FFDCD1';
        })(),
        gradient: (() => {
            if (wearable?.image?.type === 'gradient') {
                const { src: string } = wearable;
                const gradientDescription = string.split('(')[1];
                const values = gradientDescription.split(',');
                const deg = values[0].split('').filter(char => /[0-9]/.test(char)).join('');
                const start = values[1].trim();
                const end = '#' + values[2].split('').filter(char => /[a-zA-Z0-9]/.test(char)).join('');
                const array = [deg, start, end];
                return array;
            }
            return [135, '#FFDCD1', '#C0C6FF'];
        })(),
        image: (() => {
            return (wearable?.image?.type === 'image')
                ? [wearable.src, wearable.image.size]
                : ['', 50];
        })()
    }
    const [formData, updateFormData, setFormDataDirectly] = useFormData({
        teacherCode: wearable?.teacherCode ?? teacher._id,
        name: wearable?.name ?? '',
        category: '1',
        src: wearable?.src ?? getDefault.color,
        value: wearable?.value ?? '',
        occupies: wearable?.occupies ?? [],
        active: wearable?.active ?? addingNew,
        flag: wearable?.flag ?? addingNew,
        image: wearable?.image ?? {
            type: 'color',
            size: 100
        }
    });
    const wallpaperType = formData?.image?.type;
    return (
        <ModalForm onSubmit={() => handleSubmit(formData)} handleSuccess={handleSuccess} handleFormError={updateFormError}
                   title={addingNew ? 'Add new wallpaper' : 'Edit this wallpaper'}
                   submit={addingNew ? <Submit nvm="Back" cancel={cancel} /> : <Submit value="Save changes" />}>
            <div className="wearableForm">
                <div>
                    <Input
                        type="text"
                        name="name"
                        label="Wallpaper name:"
                        defaultValue={formData?.name}
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('name')} />
                    <WallpaperTypeInput {...{
                        wallpaperType,
                        getDefault,
                        addingNew,
                        wearable,
                        setFormDataDirectly
                    }} />
                    <WallpaperSrcInput {...{
                        wallpaperType,
                        formData,
                        updateFormData,
                        setFormDataDirectly,
                        getDefault,
                        resetFormError,
                        warnFormError
                    }} />
                    <Input
                        type="number"
                        name="value"
                        label="Wallpaper value:"
                        defaultValue={formData?.value}
                        onChange={updateFormData}
                        onInput={resetFormError}
                        inputHint={warnFormError('value')} />
                </div>
                <div>
                    <ManageWallpaperImage {...{ defaultImage: getDefault.image, formData, setFormDataDirectly }} />
                    <WearableOptions {...{ formData, setFormDataDirectly }} />
                </div>
            </div>
        </ModalForm>
    );
}

const WallpaperTypeInput = ({ wallpaperType, getDefault, addingNew, wearable, setFormDataDirectly }) => {
    useEffect(() => {
        const generateValue = (type) => {
            if (type === 'gradient') {
                const [deg, start, end] = getDefault.gradient;
                return [`linear-gradient(${deg}deg, ${start}, ${end})`, 100];
            }
            if (type === 'color') {
                return [getDefault.color, 100];
            }
            return getDefault.image;
        }
        const [src, size] = generateValue(wallpaperType);
        setFormDataDirectly(prevState => ({
            ...prevState,
            src,
            image: {
                type: wallpaperType,
                size
            }
        }));
    }, [wallpaperType]);
    const updateWallpaperType = (value) => {
        const image = (() => {
            switch (value) {
                case 'color': return {
                    type: 'color',
                    size: 100
                };
                case 'gradient': return {
                    type: 'gradient',
                    size: 100
                };
                case 'image': return {
                    type: 'image',
                    size: 50
                };
                default: return null;
            }
        })();
        setFormDataDirectly(prevState => ({ ...prevState, image }));
    }
    const listItems = [
        { display: 'Solid color', value: 'color' },
        { display: 'Gradient', value: 'gradient' },
        { display: 'Image', value: 'image' }
    ]
    const defaultValue = (() => {
        if (addingNew) return listItems[0];
        const index = listItems.findIndex(item => item.value === wearable?.image?.type);
        if (index === -1) return listItems[0];
        return listItems[index];
    })();
    return (
        <InputDropdown
            name="category"
            label="Wallpaper type:"
            defaultValue={defaultValue}
            listItems={listItems}
            onChange={updateWallpaperType}
            style={{ minWidth: '10rem' }} />
    );
}

const WallpaperSrcInput = ({ wallpaperType, getDefault, formData, updateFormData, setFormDataDirectly, resetFormError, warnFormError }) => {
    const [reset, setReset] = useState(false);
    useEffect(() => {
        const resetValue = () => {
            switch (wallpaperType) {
                case 'color': return { value: getDefault.color };
                case 'gradient': return { value: getDefault.gradient };
                case 'image': return { value: getDefault.image[0] };
                default: return true;
            }
        }
        setReset(resetValue());
    }, [wallpaperType]);
    let inputType = 'color',
        inputLabel = 'Wallpaper color:';
    switch (wallpaperType) {
        case 'color': {
            inputType = 'color';
            inputLabel = 'Wallpaper color:';
            break;
        }
        case 'gradient': return (
            <GradientInput {...{
                setFormDataDirectly,
                defaultGradient: getDefault.gradient,
                reset,
                updateReset: setReset
            }} />
        );
        case 'image': {
            inputType = 'text';
            inputLabel = 'Image link:';
            break;
        }
        default: {}
    }
    return (
        <Input
            type={inputType}
            name="src"
            label={inputLabel}
            defaultValue={formData.src}
            onChange={updateFormData}
            onInput={resetFormError}
            inputHint={warnFormError('src')}
            {...{ reset, updateReset: setReset }} />
    );
}

const GradientInput = ({ defaultGradient, setFormDataDirectly }) => {
    const [deg, start, end] = defaultGradient;
    const [gradient, setGradient] = useState({
        deg,
        start,
        end
    });
    const updateGradient = (e) => {
        setGradient(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    useEffect(() => {
        const { deg, start, end } = gradient;
        setFormDataDirectly(prevState => ({
            ...prevState,
            src: `linear-gradient(${deg}deg, ${start}, ${end})`
        }));
    }, [gradient]);
    return (
        <div className="gradientInput formComponent">
            <Input
                type="number"
                name="deg"
                label="Degrees:"
                defaultValue={defaultGradient[0]}
                onChange={updateGradient} />
            <Input
                type="color"
                name="start"
                label="Start color:"
                defaultValue={defaultGradient[1]}
                onChange={updateGradient} />
            <Input
                type="color"
                name="end"
                label="End color:"
                defaultValue={defaultGradient[2]}
                onChange={updateGradient} />
        </div>
    )
}

const ManageWallpaperImage = ({ defaultImage, formData, setFormDataDirectly }) => {
    const { src, image } = formData;
    const updateWallpaperSize = (e) => {
        const size = parseInt(e.target.value) + 1;
        setFormDataDirectly(prevState => ({
            ...prevState,
            image: {
                ...prevState.image,
                size
            }
        }));
    }
    const showRange = src && image?.type === 'image';
    const defaultValue = defaultImage[1];
    return (
        <div className="wearableImage">
            <label>Preview:</label>
            <div className="previewBox">
                <div>
                    <PianopetWallpaper {...{ src, image }} />
                    <PianopetBase />
                </div>
            </div>
            {showRange && <input type="range" defaultValue={defaultValue} min="0" max="99" onChange={updateWallpaperSize} />}
        </div>
    );
}