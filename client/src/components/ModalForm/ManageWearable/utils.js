import { Checkbox } from "../../Form";

export const WearableOptions = ({ formData, setFormDataDirectly }) => {
    return (
        <>
            <Checkbox
                detailedLabel={['Make active', 'Wearables set to active are made visible to students.']}
                checked={formData?.active}
                onChange={(e) => setFormDataDirectly(prevState => ({ ...prevState, active: e.target.checked }))}
            />
            <Checkbox
                detailedLabel={['Add "new" label', 'Add a "new" sticker to this wearable.']}
                checked={formData?.flag}
                onChange={(e) => setFormDataDirectly(prevState => ({ ...prevState, flag: e.target.checked }))}
            />
        </>
    );
}

export const wearableFormPreview = ({ wearable, getCategoryObject, Splat, PianopetWallpaper }) => {
    const wearableCategory = getCategoryObject.fromId(wearable.category)?.name;
    let wearableType, wearablePreview;
    switch (wearableCategory) {
        case 'Color': {
            wearableType = 'color';
            wearablePreview = <Splat color={wearable.src} />; // OR: <PianopetBase zoom={true} color={wearable.src} />
            break;
        }
        case 'Wallpaper': {
            wearableType = 'wallpaper';
            wearablePreview = <PianopetWallpaper {...wearable} />;
            break;
        }
        default: {
            wearableType = 'wearable';
            wearablePreview = <img src={wearable.src} alt={wearable.name} />;
        }
    }
    return [wearableType, wearablePreview];
}