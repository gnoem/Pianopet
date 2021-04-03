import { useState, useEffect, useContext } from "react";
import { DataContext } from "../../contexts";
import { MarketplacePreview, MarketplaceCategories, MarketplaceWearables } from "./components";
import { handleUpdatePreview } from "./utils";

export const Marketplace = () => {
    const isMobile = false;
    const { isStudent, student, avatar, updateAvatar, categories, colorCategory, wallpaperCategory, getCategoryObject, wearables } = useContext(DataContext);
    const [category, setCategory] = useState(colorCategory);
    const [preview, setPreview] = useState(avatar ?? {});
    const previewObject = isMobile ? [avatar, updateAvatar] : [preview, setPreview];
    const updatePreview = handleUpdatePreview(previewObject, wearables, getCategoryObject);
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
        <div className="Marketplace">
            <MarketplacePreview {...{ preview, student, isStudent }} />
            <MarketplaceCategories {...{ isStudent, wearables, categories, colorCategory, wallpaperCategory, updateCategory: setCategory }} />
            <MarketplaceWearables {...{ isStudent, student, category, wearables, updatePreview }}/>
        </div>
    );
}