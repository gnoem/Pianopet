import "./ViewingStudent.css";
import { useState, useEffect, useContext } from "react";
import { Student } from "../../api";
import { DataContext, ModalContext } from "../../contexts";
import { handleError } from "../../services";
import { formatNumber } from "../../utils";
import { Sidebar } from "../Page";
import { StudentDropdown } from "../Dropdown/index.js";
import { Homework } from "../Homework";
import { Avatar } from "../Avatar/index.js";

export const ViewingStudent = ({ student, students, view, selectStudent }) => {
    return (
        <div className="ViewingStudent">
            <LeftSidebar {...{ students, view, selectStudent }} />
            <div className="HomeworkContainer">
                <Homework {...{ student }} />
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
            <h2>Shortcuts</h2>
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
            <StudentCoins {...{ student, isStudent: false }} />
            <div className="StudentStats">
                <img className="statsIcon" alt="badge icon" src="assets/Badge_ico.svg" />
                <span className="statsLabel">{student.badges.length}</span>
            </div>
        </div>
    );
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
        <div className="StudentStats">
            <img className="statsIcon" alt="coin icon" src="assets/Coin_ico.png" />
            <span className="statsLabel">{formatNumber(coinsCount)}</span>
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