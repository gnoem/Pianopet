import "./StudentOverview.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Avatar } from "../../Avatar";
import { Badges, Coins } from "../../Stats";
import { MobileContext } from "../../../contexts";

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
    const { isMobile } = useContext(MobileContext);
    const [expanded, setExpanded] = useState(false);
    const studentCardRef = useRef(null);
    const handleClick = () => {
        if (!isMobile) return selectStudent(student);
        if (expanded) return selectStudent(student);
        else return setExpanded(true);
    }
    const handleMouseOver = () => setExpanded(true);
    const handleMouseLeave = () => setExpanded(false);
    useEffect(() => {
        if (!isMobile) return;
        const { current: studentCard } = studentCardRef;
        if (!studentCard) return;
        const closeCard = (e) => {
            if (!studentCard.contains(e.target)) {
                if (expanded) setExpanded(false);
            }
        }
        window.addEventListener('click', closeCard);
        return () => window.removeEventListener('click', closeCard);
    }, [expanded, isMobile, studentCardRef]);
    return (
        <button ref={studentCardRef}
                onClick={handleClick}
                onMouseOver={isMobile ? null : handleMouseOver}
                onMouseLeave={isMobile ? null : handleMouseLeave}>
            <Avatar {...{ student }} />
            <div className={`banner${expanded ? ' expanded' : ''}`}>
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