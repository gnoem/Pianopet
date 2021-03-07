import { useState } from 'react';
import Splat from './Splat';

export default function Closet(props) {
    const { closet, wearables, categories, avatar } = props;
    const [category, setCategory] = useState(() => {
        return categories.find(category => closet.some(wearable => wearable.category === category._id));
    });
    const getCategoryObject = {
        fromId: (id) => categories.find(item => item._id === id),
        fromName: (name) => categories.find(item => item.name === name)
    }
    const generate = {
        categoriesList: (closet) => {
            return categories.map(category => {
                const someClosetItemHasCategory = closet.some(wearable => wearable.category === category._id);
                if (!someClosetItemHasCategory) return null;
                const categoryName = category.name;
                return (
                    <button
                      key={`closet-wearableCategories-${categoryName}`}
                      onClick={() => setCategory(category)}>
                          {categoryName}
                    </button>
                );
            });
        },
        wearablesList: (category) => {
            const currentCategory = category.name;
            const handleClick = ({ category, occupies, _id, name, src, image }) => {
                const categoryName = getCategoryObject.fromId(category)?.name ?? category;
                if (!image) { // if this is a color, not a clothing item
                    props.handleUpdateAvatar({
                        ...avatar,
                        Color: { _id, name, src }
                    });
                    return;
                }
                props.handleUpdateAvatar((() => {
                    const regionsOccupied = (occupies = occupies) => {
                        return occupies.map(occupiedRegionId => getCategoryObject.fromId(occupiedRegionId)?.name);
                    }
                    const regionsOccupiedByThisWearable = regionsOccupied(occupies);
                    const isTakingOffWearable = avatar[categoryName]?._id === _id;
                    const avatarObjectMinusThisWearable = () => {
                        const previewObjectMinusCategory = (prevState) => {
                            const obj = {...prevState};
                            for (let property in prevState) {
                                if (regionsOccupiedByThisWearable.includes(property)) delete obj[property];
                            }
                            delete obj[categoryName];
                            return obj;
                        }
                        return previewObjectMinusCategory(avatar);
                    }
                    if (isTakingOffWearable) return avatarObjectMinusThisWearable();
                    const avatarObject = () => {
                        // generate empty object to write and return as avatar object:
                        const obj = {...avatar};
                        // if you try to put on a hat and region "head" is occupied by some other wearable,
                        // remove that wearable and also remove all the categories it is occupying:
                        if (obj[categoryName]?.isOccupied) {
                            // get the id of the guilty wearable to find what regions it occupies
                            // and remove it, as well as those regions, from avatar object
                            const guiltyWearable = wearables.find(item => item._id === avatar[categoryName].isOccupied);
                            const regionsOccupiedByGuiltyWearable = regionsOccupied(guiltyWearable.occupies);
                            // remove guilty wearable
                            const guiltyWearableCategory = getCategoryObject.fromId(guiltyWearable.category)?.name;
                            delete obj[guiltyWearableCategory];
                            // remove occupied regions
                            for (let region of regionsOccupiedByGuiltyWearable) delete obj[region];
                        }
                        // if the wearable you are trying to preview occupies any regions,
                        // then set those regions to { isOccupied: thisWearableId }
                        for (let region of regionsOccupiedByThisWearable) obj[region] = { isOccupied: _id };
                        // set the actual wearable
                        obj[categoryName] = { _id, name, src, image };
                        return obj;
                    }
                    return avatarObject();
                })());
            }
            const list = closet.map(wearable => {
                const wearableCategory = getCategoryObject.fromId(wearable.category)?.name;
                if (wearableCategory !== currentCategory) return null;
                const currentlyPreviewing = avatar[currentCategory]?._id === wearable._id;
                return (
                    <button
                      key={`closetItem-${currentCategory}-${wearable._id}`}
                      className={currentlyPreviewing ? 'active' : ''} // if currently previewing, add light green background or something
                      onClick={() => handleClick(wearable)}>
                        {currentCategory === 'Color'
                            ? <Splat color={wearable.src} />
                            : <img alt={wearable.name} src={wearable.src} />}
                        <span>{wearable.name}</span>
                    </button>
                );
            });
            const hasDefaultColor = !avatar['Color'] || avatar['Color'].src === '#5C76AE';
            if (currentCategory === 'Color') list.splice(0, 0, (
                <button
                    key={`closetItem-defaultColor`}
                    className={hasDefaultColor ? 'active' : ''}
                    onClick={() => handleClick({ category: 'Color', src: '#5C76AE' })}>
                    <Splat color="#5C76AE" />
                    <span>Default</span>
                </button>
            ));
            return list;
        }
    }
    return (
        <div className="Closet">
            <div id="demo" onClick={() => console.dir(avatar)}></div>
            <div className="wearableCategories">
                {generate.categoriesList(closet)}
            </div>
            <div className="wearablesList">
                <div className={category.name === 'Color' ? 'blobs' : null}>
                    {generate.wearablesList(category)}
                </div>
            </div>
        </div>
    );
}