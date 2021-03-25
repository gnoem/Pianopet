import React, { useState, useEffect, useContext } from "react";
import { Student } from "../../api";
import { handleError } from "../../services";
import { HomeworkContext, ModalContext } from "../../contexts";
import { Homework } from "../Homework";
import Loading from "../Loading";

export const StudentHomework = ({ student }) => {
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);
    const { createModal } = useContext(ModalContext);
    const getHomework = () => {
        Student.getHomework(student._id)
            .then(({ homework }) => {
                setHomework(homework);
                setLoading(false);
            })
            .catch(err => handleError(err, { createModal }));
    }
    useEffect(getHomework, []);
    const showHomework = () => {
        if (!homework.length) return 'No homework!!!'; // todo better error
        return homework.map(homework => (
            <Homework
                key={`homework-${homework._id}`}
                {...homework}
                refreshHomework={getHomework}
            />
        ));
    }
    return (
        <HomeworkContext.Provider value={{ homework, refreshHomework: getHomework }}>
            <h1>My Homework Tracker</h1>
            <div className="ViewHomework">
                {loading ? <Loading mini="true" style={{ height: '3rem', marginTop: '5rem' }} /> : showHomework()}
            </div>
        </HomeworkContext.Provider>
    );
}