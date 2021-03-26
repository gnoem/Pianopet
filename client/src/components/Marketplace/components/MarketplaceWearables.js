import { useRef } from "react";
import { DefaultColorItem, WearableItem, WearablesList } from "../../Wearables";

export const MarketplaceWearables = ({ isStudent, student, category, wearables, updatePreview }) => {
    const wearableRefs = useRef({});
    const marketplaceWearables = () => {
        const filteredList = wearables.filter(wearable => wearable.category === category._id);
        const list = filteredList.map(wearable => {
            const ownsWearable = (() => {
                if (!isStudent) return false;
                if (student.closet.includes(wearable._id)) return true;
                return false;
            })();
            return (
                <WearableItem
                    ref={(el) => wearableRefs.current[wearable._id] = el}
                    key={`${category.name}-wearable-${wearable.name}`}
                    className={ownsWearable ? 'owned' : ''}
                    includeCost={true}
                    onClick={() => updatePreview(wearable)}
                    onContextMenu={() => console.log('context menu click')}
                    {...{ wearable, currentCategory: category.name }}
                />
            );
        });
        return list;
    }
    const includeDefaultColor = () => {
        if (category.name === 'Color') return <DefaultColorItem handleClick={() => console.log('click on default color')} />;
    }
    const addColorButton = () => {
        if (isStudent) return;
        if (category.name !== 'Color') return;
        return <button key="color-wearable-addNew" className="add" onClick={() => console.log('add new color')}></button>;
    }
    return (
        <WearablesList {...{ category }}>
            {includeDefaultColor()}
            {marketplaceWearables()}
            {addColorButton()}
        </WearablesList>
    );
}