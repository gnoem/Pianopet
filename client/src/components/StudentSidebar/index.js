import { useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import { formatNumber } from "../../utils";
import { Avatar } from "../Avatar/index.js";
import { Sidebar } from "../Page";

export const StudentSidebar = ({ student }) => {
    return (
        <Sidebar>
            <div className="StudentSidebar">
                <StudentAvatar>
                    <Avatar {...{ student }} />
                </StudentAvatar>
                <StudentStats />
            </div>
        </Sidebar>
    );
}

const StudentAvatar = ({ children }) => {
    return (
        <div className="avatarContainer">
            {children}
        </div>
    )
}

const StudentStats = () => {
    const { student } = useContext(DataContext);
    const { updateView } = useContext(ViewContext);
    return (
        <div className="studentStats">
            <img className="statsIcon" alt="coin icon" src="assets/Coin_ico.png" />
            <span className="statsLabel" onClick={() => updateView({ type: 'marketplace' })}>{formatNumber(student.coins)}</span>
            <img className="statsIcon" alt="badge icon" src="assets/Badge_ico.svg" />
            <span className="statsLabel" onClick={() => updateView({ type: 'badges' })}>{student.badges.length.toString()}</span>
        </div>
    );
}