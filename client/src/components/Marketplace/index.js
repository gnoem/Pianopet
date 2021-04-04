import { useState, useEffect, useContext } from "react";
import { DataContext, MobileContext, ModalContext } from "../../contexts";
import { MarketplacePreview, MarketplaceCategories, MarketplaceWearables } from "./components";
import { PreviewDescription } from "./components/MarketplacePreview";
import { handleUpdatePreview } from "./utils";

export const Marketplace = () => {
    const { isMobile } = useContext(MobileContext);
    const { createModal } = useContext(ModalContext);
    const { isStudent, student, avatar, updateAvatar, categories, colorCategory, wallpaperCategory, getCategoryObject, wearables } = useContext(DataContext);
    const [category, setCategory] = useState(colorCategory);
    const [preview, setPreview] = useState(avatar ?? {});
    const objectToUpdate = isMobile ? [avatar, updateAvatar] : [preview, setPreview];
    const updatePreview = handleUpdatePreview(objectToUpdate, wearables, getCategoryObject);
    useEffect(() => {
        // this useEffect is for when the teacher is editing a wearable (e.g. updating image source/coords, color hex) while previewing that
        // same wearable in the preview box - when 'wearables' array is refetched after submit, we loop through the preview object and update it
        // with the most recent information
        const previewIsEmpty = !preview || (preview && Object.keys(preview).length === 0);
        if (isStudent || previewIsEmpty) return;
        const updatedPreviewObject = (preview) => {
            const updatedObject = {};
            for (let categoryName in preview) {
                const wearableId = preview[categoryName]._id;
                if (!wearableId) break; // means there's something wrong - db 'wearable.occupies' array possibly corrupted, random undefined
                const getWearableObjectFromId = (id) => wearables.find(item => item._id === id);
                const wearable = getWearableObjectFromId(wearableId);
                if (!wearable) break; // probably the wearable has just been deleted
                const category = getCategoryObject.fromId(wearable.category);
                const { _id, name, src, value, image, occupies } = getWearableObjectFromId(wearableId)
                updatedObject[category.name] = { _id, name, src, value, image, occupies };
            }
            return updatedObject;
        }
        setPreview(prevState => updatedPreviewObject(prevState));
    }, [wearables]);
    return (
        <>
            <div className="Marketplace">
                {isMobile || <MarketplacePreview {...{ preview, student, isStudent }} />}
                <MarketplaceCategories {...{ isStudent, wearables, categories, colorCategory, wallpaperCategory, updateCategory: setCategory }} />
                <MarketplaceWearables {...{ isStudent, student, category, wearables, updatePreview }}/>
            </div>
            <ViewCartButton {...{ isMobile, isStudent, student, objectToUpdate, createModal }} />
        </>
    );
}

const ViewCartButton = ({ isMobile, isStudent, student, objectToUpdate, createModal }) => {
    const previewObject = objectToUpdate[0];
    const [newItemsInCart, setNewItemsInCart] = useState(null);
    useEffect(() => {
        if (!isStudent) return;
        // loop through preview and check if owned
        const newItems = [];
        for (let categoryName in previewObject) {
            if (previewObject[categoryName]._id) { // default color _id is undefined, and also if preview[category].isOccupied it won't have _id
                const isOwned = student.closet.includes(previewObject[categoryName]._id);
                if (!isOwned) newItems.push(previewObject[categoryName].name);
            }
        }
        setNewItemsInCart(newItems.length);
    }, [previewObject]);
    const handleClick = () => {
        createModal(<MobileCartDescription {...{ previewObject, student, isStudent }} />);
    }
    if (!isMobile || !isStudent) return null;
    return (
        <div className="viewCart">
            <button onClick={handleClick}>
                <i className="fas fa-shopping-cart"></i>
                {newItemsInCart > 0 && <span>{newItemsInCart}</span>}
            </button>
        </div>
    );
}

const MobileCartDescription = ({ previewObject, student, isStudent }) => {
    return (
        <div>
            <h2>Currently previewing:</h2>
            <p>You are currently previewing the following items. If you own an item, you will see a checkmark icon next to it. If you would like to buy an item, click on the purple button.</p>
            <div className="marketplacePreview">
                <PreviewDescription {...{
                    preview: previewObject,
                    student,
                    isStudent,
                    fromModal: true
                }} />
            </div>
        </div>
    );
}