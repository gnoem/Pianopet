import { useState } from 'react';
import Splat from './Splat';

export default function Closet(props) {
    const { closet, avatar, categories } = props;
    const [category, setCategory] = useState(() => {
        return categories.find(category => closet.some(wearable => wearable.category === category._id));
    });
    const generate = {
        categoriesList: (closet) => {
            return categories.map(category => {
                const someClosetItemHasCategory = closet.some(wearable => wearable.category === category._id);
                if (!someClosetItemHasCategory) return null;
                return (
                    <button
                      key={`closet-wearableCategories-${category.name}`}
                      onClick={() => setCategory(category)}>
                          {category.name}
                    </button>
                );
            });
        },
        wearablesList: (category) => {
            const { _id: categoryId, name: categoryName } = category;
            const handleClick = ({ _id, name, src, image }) => {
                if (!image) { // if this is a color, not a clothing item
                    props.handleUpdateAvatar({
                        ...avatar,
                        Color: { _id, name, src }
                    });
                    return;
                }
                props.handleUpdateAvatar((() => {
                    if (avatar[categoryName] && avatar[categoryName]._id === _id) {
                        let prevStateMinusThisCategory = {...avatar};
                        delete prevStateMinusThisCategory[categoryName];
                        return prevStateMinusThisCategory;
                    }
                    return ({
                        ...avatar,
                        [categoryName]: { _id, name, src, image }
                    });
                })());
            }
            const list = closet.map(wearable => {
                const currentlyPreviewing = avatar[categoryName] && avatar[categoryName]._id === wearable._id;
                if (wearable.category !== categoryId) return null;
                return (
                    <button
                      key={`closetItem-${categoryName}-${wearable._id}`}
                      className={currentlyPreviewing ? 'active' : ''} // if currently previewing, add light green background or something
                      onClick={() => handleClick(wearable)}>
                        {categoryName === 'Color'
                            ? <Splat color={wearable.src} />
                            : <img alt={wearable.name} src={wearable.src} />}
                        <span>{wearable.name}</span>
                    </button>
                );
            });
            const hasDefaultColor = !avatar['Color'] || avatar['Color'].src === '#5C76AE';
            if (categoryName === 'Color') list.splice(0, 0, (
                <button
                    key={`closetItem-${categoryName}-defaultColor`}
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
                <div className={category === 'Color' ? 'blobs' : null}>
                    {generate.wearablesList(category)}
                </div>
            </div>
        </div>
    );
}