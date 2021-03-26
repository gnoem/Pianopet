import { Marketplace } from "../Marketplace/index.js";

export const TeacherMarketplace = () => {
    const addNewWearable = () => console.log('add new wearable');
    return (
        <div className="TeacherMarketplace">
            <h1>Marketplace</h1>
            <Marketplace />
            <button onClick={addNewWearable}>Add new wearable</button>
        </div>
    );
}