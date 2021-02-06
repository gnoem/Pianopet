import { useState } from 'react';

export default function Marketplace(props) {
    const { wearables } = props;
    console.table(wearables);
    const [preview, setPreview] = useState({});
    const [category, setCategory] = useState('head');
    const updatePreview = ({ category, src, name }) => {
        setPreview(prevState => ({
            ...prevState,
            [category]: { src, name }
        }));
    }
    const generatePreview = (preview) => {
        console.table(preview);
    }
    const generateWearables = (category) => {
        console.table(wearables);
        const filteredList = wearables.filter(wearable => wearable.category === category);
        const array = [];
        for (let i = 0; i < filteredList.length; i++) {
            array.push(
                <div className="wearableItem" key={`${category}-wearable-${filteredList[i].name}`}>
                    <button className="stealth">
                        <img
                            alt={filteredList[i].name}
                            src={filteredList[i].src}
                            onClick={() => updatePreview(filteredList[i])} />
                    </button>
                </div>
            );
        }
        return array;
    }
    return (
        <div className="Marketplace">
            <div className="marketplacePreview">
                {generatePreview(preview)}
            </div>
            <div className="marketplaceCategories">
                <button className="stealth" onClick={() => setCategory('head')}>Head</button>
                <button className="stealth" onClick={() => setCategory('face')}>Face</button>
                <button className="stealth" onClick={() => setCategory('body')}>Body</button>
            </div>
            <div className="marketplaceWearables">
                {generateWearables(category)}
            </div>
        </div>
    )
}