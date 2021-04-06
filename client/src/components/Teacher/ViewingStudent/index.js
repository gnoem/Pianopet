import "./ViewingStudent.css";
import { useState, useEffect, useContext, useRef } from "react";
import { Student } from "../../../api";
import { DataContext, MobileContext, ModalContext } from "../../../contexts";
import { handleError } from "../../../services";
import { Center } from "../../Center";
import { StudentDropdown } from "../../Dropdown";
import { Homework } from "../../Homework";
import { Avatar } from "../../Avatar";
import { Badges, Coins } from "../../Stats";

export const ViewingStudent = ({ student, students, view, selectStudent }) => {
    const { isMobile } = useContext(MobileContext);
    const [expanded, setExpanded] = useState(!isMobile);
    const containerRef = useRef(null);
    const scrollPointRef = useRef(null);
    const toggleExpanded = () => setExpanded(prev => !prev);
    useEffect(() => {
        if (!isMobile) return;
        const { current: container } = containerRef;
        const { current: scrollPoint } = scrollPointRef;
        if (!scrollPoint || !container) return;
        if (expanded) {
            const distanceToScroll = scrollPoint.offsetTop;
            setTimeout(() => {
                container.scrollTo({
                    top: distanceToScroll + 9,
                    left: 0,
                    behavior: 'smooth'
                });
            }, 200);
        }
    }, [expanded]);
    return (
        <div className="ViewingStudent" ref={containerRef}>
            <LeftSidebar {...{ students, view, selectStudent }} />
            <div className="HomeworkContainer">
                {isMobile && (
                    <Center>
                        <button onClick={toggleExpanded}>{expanded ? 'Hide homework' : 'View homework'}</button>
                        {expanded && <hr ref={scrollPointRef} />}
                    </Center>
                )}
                {expanded && <Homework {...{ student }} />}
            </div>
            <RightSidebar {...{ student }} />
        </div>
    );
}

const LeftSidebar = ({ students, view, selectStudent }) => {
    const onChange = (_id) => {
        const selectedStudent = students.find(student => student._id === _id);
        selectStudent(selectedStudent);
    }
    const defaultValue = (() => {
        if (view.type !== 'student' || !view.student) return null;
        return {
            value: view.student._id,
            display: `${view.student.firstName} ${view.student.lastName}`
        }
    })();
    const restoreDefault = view.type !== 'student';
    return (
        <div className="ControlPanel">
            <h2>Viewing student:</h2>
            {students.length && (
                <div>
                    <label>Select a student:</label>
                    <StudentDropdown
                        {...{ students, onChange, defaultValue, restoreDefault }}
                    />
                </div>
            )}
        </div>
    );
}

const RightSidebar = ({ student }) => {
    return (
        <div className="ViewingStudentSidebar">
            <div className="avatarContainer">
                <Avatar {...{ student }} />
            </div>
            <StudentStats {...{ student }} />
        </div>
    );
}

const StudentStats = ({ student }) => {
    return (
        <div className="ViewingStudentStats">
            <StudentCoins {...{ student, isStudent: false }} />
            <Badges>{student.badges.length}</Badges>
        </div>
    )
}

const StudentCoins = ({ student }) => {
    const { createModal } = useContext(ModalContext);
    const { refreshData } = useContext(DataContext);
    const [makingChanges, setMakingChanges] = useState(false);
    const [coinsCount, setCoinsCount] = useState(student.coins);
    useEffect(() => {
        setCoinsCount(student.coins);
    }, [student]);
    const handleUpdateCoins = () => {
        return Student.updateCoins(student._id, { coins: coinsCount }).then(() => {
            setMakingChanges(false);
            refreshData();
        }).catch(err => {
            handleError(err, { createModal });
        });
    }
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
        <div className="editCoins">
            <Coins>{coinsCount}</Coins>
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