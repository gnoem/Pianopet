import React, { useContext } from "react";
import { DataContext } from "../../../contexts";
import { Coins } from "../../Stats";
import { Splat } from "../../Splat";
import { PianopetWallpaper } from "../../Avatar/PianopetWallpaper";

export const WearableItem = React.forwardRef(({ className, includeCost, wearable, currentCategory, onClick, onContextMenu }, ref) => {
    const { getCategoryObject } = useContext(DataContext);
    const wearableCategory = getCategoryObject.fromId(wearable.category)?.name;
    if (wearableCategory !== currentCategory) return null;
    let buttonImage;
    switch (currentCategory) {
        case 'Color': {
            buttonImage = <Splat color={wearable.src} />;
            break;
        }
        case 'Wallpaper': {
            buttonImage = <PianopetWallpaper {...wearable} />;
            break;
        }
        default: {
            buttonImage = <img alt={wearable.name} src={wearable.src} />;
        }
    }
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

const DefaultWearableItem = ({ children, categoryName, avatar, isMarketplace, handleClick }) => {
    const { isStudent } = useContext(DataContext);
    const className = (() => {
        const isWearingItem = (() => {
            if (!avatar) return false;
            return !avatar[categoryName];
        })();
        let stringToReturn = isMarketplace ? 'owned' : '';
        if (isWearingItem) stringToReturn += ' active';
        return stringToReturn;
    })();
    return (
        <button key={`closetItem-defaultColor`}
                className={isStudent ? className : null}
                onClick={handleClick}>
            {children}
            <span>Default</span>
            {isMarketplace && <Coins inline={true}>0</Coins>}
        </button>
    );
}

export const DefaultColorItem = ({ avatar, isMarketplace, handleClick }) => {
    return (
        <DefaultWearableItem categoryName="Color"
                             key={`closetItem-default`}
                             {...{ avatar, isMarketplace, handleClick }}>
            <Splat color="#6C76AE" />
        </DefaultWearableItem>
    );
}

export const DefaultWallpaperItem = ({ avatar, isMarketplace, handleClick }) => {
    const testWallpaper = {
        src: '#fff'
    }
    return (
        <DefaultWearableItem categoryName="Wallpaper"
                             key={`closetItem-default`}
                             {...{ avatar, isMarketplace, handleClick }}>
            <PianopetWallpaper {...testWallpaper} />
        </DefaultWearableItem>
    );
}