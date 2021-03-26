import { useEffect, useState } from "react";
import { formatCoins } from "../../utils";
import { Homework } from "../Homework";
import { Avatar } from "../Avatar/index.js";

export const ViewingStudent = ({ student }) => {
    return (
        <>
            <Homework {...{ student }} />
            <Sidebar {...{ student }} />
        </>
    );
}

const Sidebar = ({ student }) => {
    return (
        <div className="ViewingStudentSidebar">
            <div className="avatarContainer">
                <Avatar />
            </div>
            <StudentCoins {...{ student }} />
            <div className="StudentStats">
                <img className="statsIcon" alt="badge icon" src="assets/Badge_ico.svg" />
                <span className="statsLabel">{student.badges.length}</span>
            </div>
        </div>
    );
}

const StudentCoins = ({ student }) => {
    const [makingChanges, setMakingChanges] = useState(false);
    const [coinsCount, setCoinsCount] = useState(student.coins);
    const handleUpdateCoins = () => console.log('updating coins');
    const editCoinsButtons = (() => (
        <div>
            <button className="stealth link" onClick={() => addCoins(-10)}><i className="fas fa-minus-circle"></i></button>
            <button className="stealth link" onClick={() => addCoins(10)}><i className="fas fa-plus-circle"></i></button>
        </div>
    ))();
    const addCoins = (amount) => setCoinsCount(coinsCount + amount);
    const cancelEditCoins = () => {
        setMakingChanges(false);
        setCoinsCount(student.coins);
    }
    return (
        <div className="StudentStats">
            <img className="statsIcon" alt="coin icon" src="assets/Coin_ico.png" />
            <span className="statsLabel">{formatCoins(coinsCount)}</span>
            <div className="editCoinsButton">
                {makingChanges
                    ? editCoinsButtons
                    : <button className="stealth link" onClick={() => setMakingChanges(true)}>Edit</button>
                }
            </div>
            {makingChanges && (
                <div className="confirmChangesButton">
                    <button className="secondary" onClick={handleUpdateCoins}>Save</button>
                    <button className="secondary greyed" onClick={cancelEditCoins}>Cancel</button>
                </div>
            )}
        </div>
    );
}