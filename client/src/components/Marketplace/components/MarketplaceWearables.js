import { useContext, useRef } from "react";
import { ModalContext } from "../../../contexts";
import { DefaultColorItem, WearableItem, WearablesList } from "../../Wearables";

export const MarketplaceWearables = ({ isStudent, student, category, wearables, updatePreview }) => {
    const wearableRefs = useRef({});
    const { createContextMenu, createModal } = useContext(ModalContext);
    const marketplaceWearables = () => {
        const filteredList = wearables.filter(wearable => wearable.category === category._id);
        if (!filteredList.length) return (
            <div className="noneFound">None found!</div>
        );
        const list = filteredList.map(wearable => {
            const ownsWearable = (() => {
                if (!isStudent) return false;
                if (student.closet.includes(wearable._id)) return true;
                return false;
            })();
            const handleClick = () => updatePreview(wearable);
            const contextMenuClick = (e) => {
                e.preventDefault();
                const listItems = [
                    { display: 'Edit', onClick: () => createModal('editWearable', 'form', { wearable }) },
                    { display: 'Delete', onClick: () => createModal('deleteWearable', 'form', { wearable, element: wearableRefs.current[wearable._id] }) },
                ];
                createContextMenu(e, listItems, { className: 'editdelete' });
            }
            return (
                <WearableItem
                    ref={(el) => wearableRefs.current[wearable._id] = el}
                    key={`${category.name}-wearable-${wearable.name}`}
                    className={ownsWearable ? 'owned' : ''}
                    includeCost={true}
                    onClick={handleClick}
                    onContextMenu={isStudent ? null : contextMenuClick}
                    isColor={category.name === 'Color'}
                    currentCategory={category.name}
                    wearable={wearable}
                />
            );
        });
        return list;
    }
    const includeDefaultColor = () => {
        if (category.name === 'Color') return (
            <DefaultColorItem
                className="owned"
                isMarketplace={true}
                handleClick={() => updatePreview({})} />
        );
    }
    return (
        <WearablesList {...{ category }}>
            {includeDefaultColor()}
            {marketplaceWearables()}
        </WearablesList>
    );
}