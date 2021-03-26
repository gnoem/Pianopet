import "./Homework.css";
import { useState, useEffect, useContext } from "react";
import { Student } from "../../api";
import { handleError } from "../../services";
import { DataContext, HomeworkContext, ModalContext } from "../../contexts";
import { HomeworkItem } from "../HomeworkItem";
import Loading from "../Loading";

export const Homework = ({ student }) => {
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isStudent } = useContext(DataContext);
    const { createModal } = useContext(ModalContext);
    const getHomework = () => {
        Student.getHomework(student._id)
            .then(({ homework }) => {
                setHomework(homework);
                setLoading(false);
            })
            .catch(err => handleError(err, { createModal }));
    }
    useEffect(getHomework, [student]);
    const showHomework = () => {
        if (!homework.length) return 'No homework!!!'; // todo better error
        return homework.map(homework => (
            <HomeworkItem
                key={`homework-${homework._id}`}
                {...{ homework, isStudent }}
                refreshHomework={getHomework}
            />
        ));
    }
    const addNewHomework = () => createModal('createHomework', 'form');
    return (
        <HomeworkContext.Provider value={{ homework, refreshHomework: getHomework }}>
            <div className="HomeworkHeader">
                <h1>{student.firstName}'s Homework</h1>
                {isStudent || <button onClick={addNewHomework}>Add homework</button>}
            </div>
            <div className="Homework">
                {loading ? <Loading mini="true" style={{ height: '3rem', marginTop: '5rem' }} /> : showHomework()}
            </div>
        </HomeworkContext.Provider>
    );
}