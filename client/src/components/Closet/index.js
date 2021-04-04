import { useState, useContext } from "react";
import { Student } from "../../api";
import { DataContext, MobileContext, ModalContext } from "../../contexts";
import { handleError } from "../../services";
import { MobileAvatarPreview } from "../Avatar/index.js";
import { CategoryList, WearableItem, DefaultColorItem, DefaultWallpaperItem, WearablesList } from "../Wearables";
import { createAvatarObjectForUpdate } from "./utils";

export const Closet = () => {
    const { isMobile } = useContext(MobileContext);
    const { student, avatar, closet, wearables, categories, colorCategory, wallpaperCategory } = useContext(DataContext);
    const [category, setCategory] = useState(colorCategory);
    if (!closet.length) return (
        <div>Your Closet is empty! Visit the Marketplace to start shopping for items and accessories to dress up your Pianopet.</div>
    );
    return (
        <>
            {isMobile && <MobileAvatarPreview {...{ student, mobilePreview: avatar }} />}
            <div className="Closet">
                <ClosetCategories {...{ closet, categories, colorCategory, wallpaperCategory, updateCategory: setCategory }} />
                <ClosetWearablesList {...{ closet, category, categories, wearables, avatar }} />
            </div>
        </>
    );
}

const ClosetCategories = ({ closet, categories, updateCategory }) => {
    const generateCategoriesList = () => {
        const wearableCategoryButtons = categories.map(category => {
            const someClosetItemHasCategory = closet.some(wearable => wearable.category === category._id);
            if (!someClosetItemHasCategory) return null;
            const categoryName = category.name;
            return (
                <button key={`closet-wearableCategories-${categoryName}`}
                        onClick={() => updateCategory(category)}>
                    {categoryName}
                </button>
            );
        });
        return wearableCategoryButtons;
    }
    return (
        <CategoryList {...{ updateCategory }}>
            {generateCategoriesList()}
        </CategoryList>
    );
}

const ClosetWearablesList = ({ closet, category, wearables, avatar }) => {
    const { student, updateAvatar, getCategoryObject, refreshData } = useContext(DataContext);
    const { createModal } = useContext(ModalContext);
    const handleUpdateAvatar = async (updatedAvatar) => {
        updateAvatar(updatedAvatar); // go ahead and update UI - we are assuming api call will be successful
        const avatarStringIds = Object.keys(updatedAvatar).map(key => updatedAvatar[key]._id);
        Student.updateAvatar(student._id, { avatar: avatarStringIds }).then(() => {
            refreshData();
        }).catch(err => {
            handleError(err, { createModal });
        });
    }
    const wearablesList = () => {
        if (!category) return null;
        const currentCategory = category.name;
        const handleClick = (wearableAttributes) => {
            const { category, _id, name, src, image } = wearableAttributes;
            const categoryName = getCategoryObject.fromId(category)?.name;
            if (categoryName === 'Color') return handleUpdateAvatar({ ...avatar, Color: { _id, name, src }});
            if (categoryName === 'Wallpaper') return handleUpdateAvatar({ ...avatar, Wallpaper: { _id, name, image, src } });
            const obj = createAvatarObjectForUpdate({ ...wearableAttributes, avatar, wearables, categoryName, getCategoryObject });
            handleUpdateAvatar(obj);
        }
        const list = closet.map(wearable => {
            const currentlyPreviewing = avatar[currentCategory]?._id === wearable._id;
            const className = currentlyPreviewing ? 'active' : '';
            return (
                <WearableItem
                    className={className}
                    key={`closetItem-${currentCategory}-${wearable._id}`}
                    {...{ avatar, wearable, currentCategory }}
                    onClick={() => handleClick(wearable)} />
            );
        });
        if (currentCategory === 'Color') list.splice(0, 0, (
            <DefaultColorItem
                key="defaultColor"
                handleClick={() => handleClick({
                    category: '0'
                })}
                {...{ avatar }} />
        ));
        if (currentCategory === 'Wallpaper') list.splice(0, 0, (
            <DefaultWallpaperItem
                key="defaultWallpaper"
                handleClick={() => handleClick({
                    category: '1'
                })}
                {...{ avatar }} />
        ));
        return list;
    }
    return (
        <WearablesList {...{ category }}>
            {wearablesList()}
        </WearablesList>
    );
}