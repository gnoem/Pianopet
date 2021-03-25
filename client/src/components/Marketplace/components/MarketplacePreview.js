import PianopetBase from "../../PianopetBase";

export const MarketplacePreview = ({ preview, student, isStudent }) => {
    return (
        <div className="marketplacePreview">
            <PreviewImage {...{ preview }} />
            <PreviewDescription {...{ preview, student, isStudent }} />
        </div>
    );
}

const PreviewImage = ({ preview }) => {
    const images = [];
    for (let category in preview) {
        const thisWearable = preview[category];
        if (category !== 'Color' && !thisWearable.isOccupied) {
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
}

const PreviewDescription = ({ preview, student, isStudent }) => {
    if (!isStudent) return;
    const previewItems = [];
    for (let category in preview) {
        if (preview[category]._id) { // default color _id is undefined, and also if preview[category].isOccupied it won't have _id
            const isOwned = student.closet.includes(preview[category]._id);
            previewItems.push(
                <li key={`marketplacePreviewDescription-${category}`}>
                    <span className="wearableName">{preview[category].name}</span>
                    {isStudent && isOwned
                        ? <span className="owned"></span>
                        : <button onClick={() => console.log('buy wearable')}>
                            <img className="coin" alt="coin icon" src="assets/Coin_ico.png" />
                            <span className="wearableValue">{preview[category].value}</span>
                          </button>
                    }
                </li>
            );
        }
    }
    return (
        <ul>
            <h3>Previewing:</h3>
            {previewItems}
        </ul>
    );
}