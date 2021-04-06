import { useContext } from "react";
import { ModalContext } from "../../../contexts";
import { Marketplace } from "../../Marketplace";

export const TeacherMarketplace = () => {
    const { createModal } = useContext(ModalContext);
    const addNewWearable = () => {
        createModal('createWearableOrColor', 'customDialog');
    }
    return (
        <div className="TeacherMarketplace">
            <h1>Marketplace</h1>
            <Marketplace />
            <button onClick={addNewWearable}>Add new wearable</button>
        </div>
    );
}