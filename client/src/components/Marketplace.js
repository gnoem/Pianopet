import { useState } from 'react';

export default function Marketplace(props) {
    const { wearables } = props;
    const [preview, setPreview] = useState({});
    const [category, setCategory] = useState('head');
    const updatePreview = ({ category, src, name }) => {
        if (preview[category]) {
            const previewObjectMinusCategory = (prevState) => {
                const object = {...prevState};
                delete object[category];
                return object;
            }
            setPreview(prevState => ({
                ...previewObjectMinusCategory(prevState)
            }));
            return;
        }
        setPreview(prevState => ({
            ...prevState,
            [category]: { src, name }
        }));
    }
    const generatePreview = (preview) => {
        const images = [];
        for (let wearable in preview) {
            images.push(<img src={preview[wearable].src} className={preview[wearable].category} />);
        }
        return images;
    }
    const generateWearables = (category) => {
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
            <div id="demo" onClick={() => console.table(preview)}></div>
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