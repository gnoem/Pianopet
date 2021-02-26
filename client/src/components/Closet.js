import { useState } from 'react';

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
            if (category === 'color') {
                const previewColor = (hex) => {
                    props.updateAvatar(prevState => ({
                        ...prevState,
                        color: hex
                    }));
                }
                const colorArray = ['#5C76AE', '#926692'];
                return colorArray.map(color => (
                    <button
                        key={`closetItem-color-${color}`}
                        className="colorBlob"
                        style={{ background: color }}
                        onClick={() => previewColor(color)}>
                    </button>
                ));
            }
            const previewWearable = ({ category, _id, src, image }) => {
                props.updateAvatar(prevState => {
                    if (prevState[category] && prevState[category]._id === _id) {
                        let prevStateMinusThisCategory = {...prevState};
                        delete prevStateMinusThisCategory[category];
                        return prevStateMinusThisCategory;
                    }
                    return ({
                        ...prevState,
                        [category]: { _id, src, image }
                    });
                });
            }
            return closet.map(wearable => {
                const currentlyPreviewing = avatar[wearable.category] && avatar[wearable.category]._id === wearable._id;
                if (wearable.category === category) return (
                    <button
                      key={`closetItem-${category}-${wearable._id}`}
                      className={currentlyPreviewing ? 'active' : ''} // if currently previewing, add light green background or something
                      onClick={() => previewWearable(wearable)}>
                        <img alt={wearable.name} src={wearable.src} />
                        <span>{wearable.name}</span>
                    </button>
                );
            });
        }
    }
    return (
        <div className="Closet">
            <div className="wearableCategories">
                <button onClick={() => setCategory('color')}>Color</button>
                {generate.categoriesList(closet)}
            </div>
            <div className="wearablesList">
                <div className={category === 'color' ? 'blobs' : null}>
                    {generate.wearablesList(category)}
                </div>
            </div>
        </div>
    );
}