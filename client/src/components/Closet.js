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
                {generate.categoriesList(closet)}
            </div>
            <div className="wearablesList">
                <div>
                    {generate.wearablesList(category)}
                </div>
            </div>
        </div>
    );
}