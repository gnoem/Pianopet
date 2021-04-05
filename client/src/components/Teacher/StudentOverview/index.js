import "./StudentOverview.css";
import { useState } from "react";
import { Avatar } from "../../Avatar";
import { Badges, Coins } from "../../Stats";

export const StudentOverview = ({ students, selectStudent }) => {
    const allStudents = () => {
        return students.map(student => (
            <StudentCard key={`viewingStudents-${student._id}`} {...{ student, selectStudent }} />
        ));
    }
    return (
        <div className="StudentOverview">
            {allStudents()}
        </div>
    );
}

const StudentCard = ({ student, selectStudent }) => {
    const { firstName, lastName, username, email, profilePic, coins, badges } = student;
    const [expanded, setExpanded] = useState(false);
    return (
        <button onClick={() => selectStudent(student)} onMouseOver={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
            <Avatar {...{ student }} />
            <div className="banner">
                {firstName} {lastName}
                {expanded && <Info {...{ username, email, profilePic, coins, badges }} />}
            </div>
        </button>
    );
}

const Info = ({ username, email, profilePic, coins, badges }) => {
    return (
        <div className="StudentInfo">
            <hr />
            {profilePic && <img className="profilePic" src={profilePic} alt="" />}
            {username && <div><strong>Username:</strong> {username}</div>}
            {email && <div><strong>Email address:</strong> {email}</div>}
            <Stats {...{ coins, badges }} />
        </div>
    );
}

const Stats = ({ coins, badges }) => {
    return (
        <div className="Stats">
            <Coins>{coins}</Coins>
            <Badges>{badges.length}</Badges>
        </div>
    );
}