import "./CategoryList.css";
import { useContext } from "react";
import { DataContext } from "../../../contexts";

export const categoryUtils = {
    constructedClassName: (category, viewingCategory, wearables, student) => {
        const isActiveCategory = category.name === viewingCategory.name;
        const containsNewWearables = (() => {
            if (!wearables) return false;
            const wearablesInCategory = wearables.map(wearable => {
                if (wearable.category === category._id) return wearable;
                return null;
            }).filter(el => el);
            // and if all wearables with active flag are already owned by user, return false
            if (wearablesInCategory.some(wearable => (wearable?.active && wearable?.flag))) {
                if (!student) return true;
                const flaggedWearables = wearablesInCategory.filter(wearable => wearable?.flag);
                const flaggedWearableIds = flaggedWearables.map(wearable => wearable._id);
                // loop through IDs - if all are present in student.closet, return false
                const flaggedWearablesOwnedByStudent = flaggedWearableIds.map(wearableId => {
                    if (student.closet.includes(wearableId)) return wearableId;
                    return null;
                }).filter(el => el);
                if (flaggedWearables.length > flaggedWearablesOwnedByStudent.length) return true;
            }
            return false;
        })();
        let string = isActiveCategory ? 'active' : '';
        if (containsNewWearables) string += ' flag--new';
        return string;
    }
}

export const CategoryList = ({ children, type, category, updateCategory }) => {
    const { isStudent, student, wearables, colorCategory, wallpaperCategory } = useContext(DataContext);
    const viewingCategory = category;
    const buttonClassName = (thisCategory) => {
        const includedWearables = (type === 'marketplace') ? wearables : null;
        const includedStudent = isStudent ? student : null;
        return categoryUtils.constructedClassName(thisCategory, viewingCategory, includedWearables, includedStudent);
    }
    const colorCategoryButton = (
        <button className={buttonClassName(colorCategory)}
                onClick={() => updateCategory(colorCategory)}>
            Color
        </button>
    );
    const wallpaperCategoryButton = (
        <button className={buttonClassName(wallpaperCategory)}
                onClick={() => updateCategory(wallpaperCategory)}>
            Wallpaper
        </button>
    );
    return (
        <div className="wearableCategories">
            {colorCategoryButton}
            {wallpaperCategoryButton}
            {children}
        </div>
    );
}