import { useContext } from "react";
import { ModalContext } from "../../../contexts";
import { CategoryList, categoryUtils } from "../../Wearables";

export const MarketplaceCategories = ({ isStudent, student, wearables, categories, category, updateCategory }) => {
    const { createModal, createContextMenu } = useContext(ModalContext);
    const viewingCategory = category;
    const marketplaceCategories = () => {
        const wearableCategoryButtons = categories.map(category => {
            const editOrDeleteCategory = (e) => {
                e.preventDefault();
                const listItems = [
                    { display: 'Edit', onClick: () => createModal('editCategory', 'form', { category }) },
                    { display: 'Delete', onClick: () => createModal('deleteCategory', 'form', { category, wearables })}
                ]
                createContextMenu(e, listItems, { className: 'editdelete' });
            }
            const buttonClassName = () => {
                const includedStudent = isStudent ? student : null;
                return categoryUtils.constructedClassName(category, viewingCategory, wearables, includedStudent);
            }
            return (
                <button key={`wearableCategories-toolbar-${category.name}`}
                        className={buttonClassName()}
                        onClick={() => updateCategory(category)}
                        onContextMenu={isStudent ? null : editOrDeleteCategory}>
                    {category.name}
                </button>
            );
        });
        if (!isStudent) wearableCategoryButtons.push(
            <button key="wearableCategories-toolbar-addNew" className="add" onClick={() => createModal('createCategory', 'form')}></button>
        );
        return wearableCategoryButtons;
    }
    return (
        <CategoryList {...{ type: 'marketplace', category, updateCategory }}>
            {marketplaceCategories()}
        </CategoryList>
    );
}