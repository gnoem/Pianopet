import { useContext } from "react";
import { DataContext } from "../../contexts";
import Splat from "../Splat";

export const CategoryList = ({ children }) => {
    return (
        <div className="wearableCategories">
            {children}
        </div>
    );
}

export const WearablesList = ({ category, children }) => {
    return (
        <div className="wearablesList">
            <div className={category?.name === 'Color' ? 'blobs' : null}>
                {children}
            </div>
        </div>
    );
}

export const WearableItem = ({ className, includeCost, wearable, currentCategory, onClick, onContextMenu }) => {
    const { getCategoryObject } = useContext(DataContext);
    const wearableCategory = getCategoryObject.fromId(wearable.category)?.name;
    if (wearableCategory !== currentCategory) return null;
    const buttonImage = (currentCategory === 'Color')
        ? <Splat color={wearable.src} />
        : <img alt={wearable.name} src={wearable.src} />;
    return (
        <button className={className}
                onClick={onClick}
                onContextMenu={onContextMenu}>
            {buttonImage}
            <span>{wearable.name}</span>
            {includeCost && (
                <span>
                    <img alt="coin icon" src="assets/Coin_ico.png" />
                    <span>{wearable.value}</span>
                </span>
            )}
        </button>
    );
}

export const DefaultColorItem = ({ avatar, handleClick }) => {
    const hasDefaultColor = (() => {
        if (!avatar) return false;
        return !avatar['Color'] || avatar['Color'].src === '#5C76AE';
    })();
    return (
        <button key={`closetItem-defaultColor`}
                className={hasDefaultColor ? 'active' : ''}
                onClick={handleClick}>
            <Splat color="#5C76AE" />
            <span>Default</span>
        </button>
    );
}