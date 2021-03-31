import React, { useContext } from "react";
import { DataContext } from "../../contexts";
import { Coins } from "../Coins";
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

export const WearableItem = React.forwardRef(({ className, includeCost, wearable, isColor, currentCategory, onClick, onContextMenu }, ref) => {
    const { getCategoryObject } = useContext(DataContext);
    const wearableCategory = isColor
        ? 'Color'
        : getCategoryObject.fromId(wearable.category)?.name;
    if (wearableCategory !== currentCategory) return null;
    const buttonImage = (currentCategory === 'Color')
        ? <Splat color={wearable.src} />
        : <img alt={wearable.name} src={wearable.src} />;
    return (
        <button ref={ref}
                className={className}
                onClick={onClick}
                onContextMenu={onContextMenu}>
            {buttonImage}
            <span>{wearable.name}</span>
            {includeCost && (
                <Coins inline={true}>{wearable.value}</Coins>
            )}
        </button>
    );
});

export const DefaultColorItem = ({ avatar, isMarketplace, handleClick }) => {
    const className = (() => {
        const hasDefaultColor = (() => {
            if (!avatar) return false;
            return !avatar['Color'] || avatar['Color'].src === '#5C76AE';
        })();
        let stringToReturn = isMarketplace ? 'owned' : '';
        if (hasDefaultColor) stringToReturn += ' active';
        return stringToReturn;
    })();
    return (
        <button key={`closetItem-defaultColor`}
                className={className}
                onClick={handleClick}>
            <Splat color="#5C76AE" />
            <span>Default</span>
            {isMarketplace && <Coins inline={true}>0</Coins>}
        </button>
    );
}