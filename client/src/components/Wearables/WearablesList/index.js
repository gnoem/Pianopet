import "./WearablesList.css";
import { useEffect, useRef } from "react";

export const WearablesList = ({ category, children }) => {
    const wearablesListRef = useRef(null);
    useEffect(() => {
        const { current: wearablesList } = wearablesListRef;
        if (!wearablesList) return;
        wearablesList.scrollTop = 0;
        wearablesList.scrollLeft = 0;
    }, [category]);
    return (
        <div className="wearablesList">
            <div className={category?.name === 'Color' ? 'blobs' : null} ref={wearablesListRef}>
                {children}
            </div>
        </div>
    );
}