import "./StudentOverview.css";
import { Avatar } from "../Avatar/index.js";

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
    const { firstName, lastName } = student;
    return (
        <button onClick={() => selectStudent(student)}>
            <Avatar {...{ student }} />
            <div className="banner">{firstName} {lastName}</div>
        </button>
    );
}