import { useState, useContext } from "react";
import { DataContext } from "../../contexts";
import { MarketplacePreview, MarketplaceCategories, MarketplaceWearables } from "./components";
import { handleUpdatePreview } from "./utils";

export const Marketplace = () => {
    const isMobile = false;
    const { isStudent, student, avatar, updateAvatar, categories, getCategoryObject, wearables } = useContext(DataContext);
    const [category, setCategory] = useState(categories[0]);
    const [preview, setPreview] = useState(avatar ?? {});
    const previewObject = isMobile ? [avatar, updateAvatar] : [preview, setPreview];
    const updatePreview = handleUpdatePreview(previewObject, wearables, getCategoryObject);
    return (
        <div className="Marketplace">
            <MarketplacePreview {...{ preview, student, isStudent }} />
            <MarketplaceCategories {...{ isStudent, categories, updateCategory: setCategory }} />
            <MarketplaceWearables {...{ isStudent, student, category, wearables, updatePreview }}/>
        </div>
    );
}