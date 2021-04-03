import { useContext } from "react";
import { ModalContext } from "../../../contexts";
import { Coins } from "../../Stats";
import PianopetBase from "../../PianopetBase";
import { PianopetWallpaper } from "../../PianopetWallpaper";

export const MarketplacePreview = ({ preview, student, isStudent }) => {
    return (
        <div className="marketplacePreview">
            <PreviewImage {...{ preview }} />
            <PreviewDescription {...{ preview, student, isStudent }} />
        </div>
    );
}

const PreviewImage = ({ preview }) => {
    if (!preview) return null;
    const { Color, Wallpaper } = preview;
    const images = [];
    for (let categoryName in preview) {
        const thisWearable = preview[categoryName];
        const isNormalWearable = !['Color', 'Wallpaper'].includes(categoryName);
        if (isNormalWearable && !thisWearable?.isOccupied) {
            const style = {
                top: `${thisWearable.image.y}%`,
                left: `${thisWearable.image.x}%`,
                width: `${thisWearable.image.w}%`
            }
            images.push(
                <img
                    alt={thisWearable.name}
                    key={`marketplacePreview-${categoryName}`}
                    className={`previewWearable ${categoryName}`}
                    src={thisWearable.src}
                    style={style}
                />
            );
        }
    }
    const testWallpaper = {
        //src: 'linear-gradient(135deg, #f1f6e9, #926692)',
        src: 'http://static.colourlovers.com/images/patterns/5816/5816002.png',
        image: {
            type: 'image',
            size: 50
        }
    }
    return (
        <div className="previewBox">
            <PianopetWallpaper {...Wallpaper} />
            <PianopetBase color={Color?.src} />
            {images}
        </div>
    );
}

const PreviewDescription = ({ preview, student, isStudent }) => {
    const { createModal } = useContext(ModalContext);
    const previewItems = [];
    for (let category in preview) {
        if (preview[category]._id) { // default color _id is undefined, and also if preview[category].isOccupied it won't have _id
            const isOwned = isStudent && student.closet.includes(preview[category]._id);
            const buyWearable = () => {
                createModal('buyWearable', 'form', { wearable: preview[category] });
                // todo update avatar with new wearable!!!
            }
            const listButton = () => {
                if (isOwned) return <span className="owned"></span>;
                else return (
                    <button onClick={buyWearable}>
                        <Coins>{preview[category].value}</Coins>
                    </button>
                );
            }
            previewItems.push(
                <li key={`marketplacePreviewDescription-${category}`}>
                    <span className="wearableName">{preview[category].name}</span>
                    {isStudent && listButton()}
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