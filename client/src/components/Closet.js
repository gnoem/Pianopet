import { useState } from 'react';
import Splat from './Splat';

export default function Closet(props) {
    const { closet, avatar, teacher } = props;
    const [category, setCategory] = useState(() => {
        return teacher.wearableCategories.find(category => closet.some(wearable => wearable.category === category));
    });
    const generate = {
        categoriesList: (closet) => {
            return teacher.wearableCategories.map(category => {
                const someClosetItemHasCategory = closet.some(wearable => wearable.category === category);
                if (someClosetItemHasCategory) return (
                    <button
                      key={`closet-wearableCategories-${category}`}
                      onClick={() => setCategory(category)}>
                          {category}
                    </button>
                )
            });
        },
        wearablesList: (category) => {
            const previewWearable = ({ category, _id, name, src, image }) => {
                if (!image) { // if this is a color, not a clothing item
                    props.updateAvatar(prevState => ({
                        ...prevState,
                        Color: { _id, name, src }
                    }));
                    return;
                }
                props.updateAvatar(prevState => {
                    if (prevState[category] && prevState[category]._id === _id) {
                        let prevStateMinusThisCategory = {...prevState};
                        delete prevStateMinusThisCategory[category];
                        return prevStateMinusThisCategory;
                    }
                    return ({
                        ...prevState,
                        [category]: { _id, name, src, image }
                    });
                });
            }
            const list = closet.map(wearable => {
                const currentlyPreviewing = avatar[wearable.category] && avatar[wearable.category]._id === wearable._id;
                if (wearable.category === category) return (
                    <button
                      key={`closetItem-${category}-${wearable._id}`}
                      className={currentlyPreviewing ? 'active' : ''} // if currently previewing, add light green background or something
                      onClick={() => previewWearable(wearable)}>
                        {category === 'Color'
                            ? <Splat color={wearable.src} />
                            : <img alt={wearable.name} src={wearable.src} />}
                        <span>{wearable.name}</span>
                    </button>
                );
            });
            const hasDefaultColor = !avatar['Color'] || avatar['Color'].src === '#5C76AE';
            if (category === 'Color') list.splice(0, 0, (
                <button
                    key={`closetItem-${category}-defaultColor`}
                    className={hasDefaultColor ? 'active' : ''}
                    onClick={() => previewWearable({ category: 'Color', src: '#5C76AE' })}>
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