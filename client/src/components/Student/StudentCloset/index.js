import { useContext } from "react";
import { DataContext } from "../../../contexts";
import { Closet } from "../../Closet";
import { Coins } from "../../Stats";

export const StudentCloset = ({ updateView }) => {
    const { student, avatar, closet, wearables, categories, colorCategory } = useContext(DataContext);
    const closetIsEmpty = () => (
        <>
            <h3>Your Closet is empty!</h3>
            {student.coins
                ? <p>
                    You have <Coins inline={true}>{student.coins}</Coins> to spend. Visit the <button className="stealth link" onClick={() => updateView({ type: 'marketplace'})}>Marketplace</button> to start shopping for items and accessories for your Pianopet!
                  </p>
                : <p>
                    Once you start earning coins, you can start shopping for items and accessories for your Pianopet. In the meantime, feel free to visit the <button className="stealth link" onClick={() => updateView({ type: 'marketplace' })}>Marketplace</button> to see what's available!
                  </p>
            }
        </>
    );
    return (
        <div className="StudentCloset">
            <h1>Closet</h1>
            {closet.length ? <Closet {...{ student, avatar, closet, wearables, categories, colorCategory }} /> : closetIsEmpty()}
        </div>
    );
}