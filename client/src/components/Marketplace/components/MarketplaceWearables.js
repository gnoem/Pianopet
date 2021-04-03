import { useContext, useRef } from "react";
import { ModalContext } from "../../../contexts";
import { DefaultColorItem, DefaultWallpaperItem, WearableItem, WearablesList } from "../../Wearables";

export const MarketplaceWearables = ({ isStudent, student, category, wearables, updatePreview }) => {
    const wearableRefs = useRef({});
    const { createContextMenu, createModal } = useContext(ModalContext);
    const marketplaceWearables = () => {
        const filteredList = wearables.filter(wearable => wearable.category === category._id);
        if (!['Color', 'Wallpaper'].includes(category.name) && !filteredList.length) return (
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
                let formName;
                switch (category.name) {
                    case 'Color': {
                        formName = 'editColor';
                        break;
                    }
                    case 'Wallpaper': {
                        formName = 'editWallpaper';
                        break;
                    }
                    default: {
                        formName = 'editWearable';
                    }
                }
                const listItems = [
                    { display: 'Edit', onClick: () => createModal(formName, 'form', { wearable }) },
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
                    wearableCategory={wearable.category}
                    currentCategory={category.name}
                    wearable={wearable}
                />
            );
        });
        return list;
    }
    const includeDefaultItem = () => {
        switch (category.name) {
            case 'Color': return (
                <DefaultColorItem
                    className="owned"
                    isMarketplace={true}
                    handleClick={() => updatePreview({
                        category: '0'
                    })} />
            );
            case 'Wallpaper': return (
                <DefaultWallpaperItem
                    className="owned"
                    isMarketplace={true}
                    handleClick={() => updatePreview({
                        category: '1'
                    })} />
            );
            default: return null;
        }
    }
    return (
        <WearablesList {...{ category }}>
            {includeDefaultItem()}
            {marketplaceWearables()}
        </WearablesList>
    );
}