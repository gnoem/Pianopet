import { useState, useContext } from "react";
import { Student } from "../../api";
import { DataContext } from "../../contexts";
import { CategoryList, WearableItem, DefaultColorItem, WearablesList } from "../Wearables";
import { createAvatarObjectForUpdate } from "./utils";

export const Closet = () => {
    const { avatar, closet, wearables, categories } = useContext(DataContext);
    const [category, setCategory] = useState(() => {
        return categories.find(category => closet.some(wearable => wearable.category === category._id));
    });
    if (!closet.length) return (
        <div>Your Closet is empty! Visit the Marketplace to start shopping for items and accessories to dress up your Pianopet.</div>
    );
    return (
        <div className="Closet">
            <ClosetCategories {...{ closet, categories, updateCategory: setCategory }} />
            <ClosetWearablesList {...{ closet, category, categories, wearables, avatar }} />
        </div>
    );
}

const ClosetCategories = ({ closet, categories, updateCategory }) => {
    const generateCategoriesList = () => {
        return categories.map(category => {
            const someClosetItemHasCategory = closet.some(wearable => wearable.category === category._id);
            if (!someClosetItemHasCategory) return null;
            const categoryName = category.name;
            return (
                <button
                  key={`closet-wearableCategories-${categoryName}`}
                  onClick={() => updateCategory(category)}>
                      {categoryName}
                </button>
            );
        });
    }
    return (
        <CategoryList>
            {generateCategoriesList()}
        </CategoryList>
    );
}

const ClosetWearablesList = ({ closet, category, wearables, avatar }) => {
    const { student, updateAvatar, getCategoryObject, refreshData } = useContext(DataContext);
    const handleUpdateAvatar = async (updatedAvatar) => {
        updateAvatar(updatedAvatar); // go ahead and update UI - we are assuming api call will be successful
        const formData = Object.keys(updatedAvatar).map(key => updatedAvatar[key]._id);
        Student.updateAvatar(student._id, { avatar: formData }).then(() => {console.log('put on clothes');refreshData()});
    }
    const wearablesList = () => {
        if (!category) return null;
        const currentCategory = category.name;
        const handleClick = (wearableAttributes) => {
            const { category, _id, name, src, image } = wearableAttributes;
            const categoryName = getCategoryObject.fromId(category)?.name ?? category;
            // if this is a color, not a clothing item:
            if (!image) return handleUpdateAvatar({ ...avatar, Color: { _id, name, src }});
            // otherwise:
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
                handleClick={() => handleClick({ category: 'Color', src: '#5C76AE' })}
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