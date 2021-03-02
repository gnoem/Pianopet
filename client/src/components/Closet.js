import { useState } from 'react';
import Splat from './Splat';

export default function Closet(props) {
    const { closet, categories, avatar } = props;
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
            const handleClick = ({ category, _id, name, src, image }) => {
                const wearableCategory = getCategoryObject.fromId(category)?.name;
                if (!image) { // if this is a color, not a clothing item
                    props.handleUpdateAvatar({
                        ...avatar,
                        Color: { _id, name, src }
                    });
                    return;
                }
                props.handleUpdateAvatar((() => {
                    if (avatar[wearableCategory] && avatar[wearableCategory]._id === _id) {
                        let prevStateMinusThisCategory = {...avatar};
                        delete prevStateMinusThisCategory[wearableCategory];
                        return prevStateMinusThisCategory;
                    }
                    return ({
                        ...avatar,
                        [wearableCategory]: { _id, name, src, image }
                    });
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
            <div id="demo" onClick={() => console.dir(category)}></div>
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