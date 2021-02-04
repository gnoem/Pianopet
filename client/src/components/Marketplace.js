import { useState } from 'react';

export default function Marketplace(props) {
    const { wearables } = props;
    const [preview, setPreview] = useState({});
    const [category, setCategory] = useState('hair');
    const updatePreview = (src, category) => {
        setPreview(prevState => ({
            ...prevState,
            [category]: src
        }));
    }
    const generatePreview = (preview) => {
        console.table(preview);
    }
    const generateWearables = (category) => {
        const filteredList = wearables.filter(wearable => wearable.category === category);
        const array = [];
        for (let i = 0; i < filteredList.length; i++) {
            array.push(
                <div className="wearableItem">
                    <button className="stealth">
                        <img
                            alt={filteredList[i].name}
                            src={filteredList[i].src} />
                            onClick={() => updatePreview(filteredList[i].src, filteredList[i].category)}
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