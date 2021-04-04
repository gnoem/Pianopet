import { useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import { Avatar } from "../Avatar/index.js";
import { Sidebar } from "../Page";
import { Badges, Coins } from "../Stats";

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
        <div className="StudentStats">
            <Coins onClick={() => updateView({ type: 'marketplace' })}>{student.coins}</Coins>
            <Badges onClick={() => updateView({ type: 'badges' })}>{student.badges.length}</Badges>
        </div>
    );
}