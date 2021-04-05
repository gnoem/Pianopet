import { useContext } from "react";
import { ModalContext } from "../../../contexts";
import { Coins } from "../../Stats";
import { PianopetBase } from "../../Avatar/PianopetBase";
import { PianopetWallpaper } from "../../Avatar/PianopetWallpaper";

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
    return (
        <div className="previewBox">
            <PianopetWallpaper {...Wallpaper} />
            <PianopetBase color={Color?.src} />
            {images}
        </div>
    );
}

export const PreviewDescription = ({ preview, student, isStudent, fromModal }) => {
    const { createModal, switchToModal } = useContext(ModalContext);
    const previewItems = [];
    for (let category in preview) {
        if (preview[category]._id) { // default color _id is undefined, and also if preview[category].isOccupied it won't have _id
            const isOwned = isStudent && student.closet.includes(preview[category]._id);
            const buyWearable = () => {
                const openModal = fromModal ? switchToModal : createModal;
                openModal('buyWearable', 'form', { wearable: preview[category] });
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