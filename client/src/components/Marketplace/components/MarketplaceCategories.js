import { CategoryList } from "../../Wearables";

export const MarketplaceCategories = ({ isStudent, categories, updateCategory }) => {
    const marketplaceCategories = () => {
        const array = categories.map(category => (
            <button
              key={`wearableCategories-toolbar-${category.name}`}
              onClick={() => updateCategory(category)}
              onContextMenu={() => console.log('edit or delete category')}>
                {category.name}
            </button>
        ))
        if (!isStudent) array.push(
            <button key="wearableCategories-toolbar-addNew" className="add" onClick={() => console.log('add new category')}></button>
        );
        return array;
    }
    return (
        <CategoryList>
            {marketplaceCategories()}
        </CategoryList>
    );
}