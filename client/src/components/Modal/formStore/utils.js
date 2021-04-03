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