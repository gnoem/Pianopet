import { useContext } from "react";
import { ModalContext } from "../../../contexts";
import { CategoryList } from "../../Wearables";

export const MarketplaceCategories = ({ isStudent, wearables, categories, updateCategory }) => {
    const { createModal, createContextMenu } = useContext(ModalContext);
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
            return (
                <button key={`wearableCategories-toolbar-${category.name}`}
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
        <CategoryList {...{ updateCategory }}>
            {marketplaceCategories()}
        </CategoryList>
    );
}