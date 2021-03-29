import "./HomeworkItem.css";
import { useContext } from "react";
import { ModalContext } from "../../contexts";
import { prettifyDate } from "../../utils";
import { Assignment } from "./Assignment";

export const HomeworkItem = ({ isStudent, homework }) => {
    const { _id, assignments } = homework;
    const homeworkAssignments = () => {
        return assignments.map((info, index) => (
            <Assignment key={`homeworkAssignment-${_id}-${index}`} {...info} {...{ isStudent, index, _id }} />
        ));
    }
    return (
        <div className="HomeworkItem">
            <HomeworkHeader {...{ isStudent, homework }} />
            <HomeworkBody>
                {homeworkAssignments()}
            </HomeworkBody>
        </div>
    );
}

const HomeworkHeader = ({ isStudent, homework }) => {
    const { date, headline } = homework;
    const { createContextMenu, createModal } = useContext(ModalContext);
    const buttonClick = (e) => {
        const editHomework = () => createModal('editHomework', 'form', { homework })
        const deleteHomework = () => createModal('deleteHomework', 'form', { homework });
        const listItems = [
            { display: 'Edit', onClick: editHomework },
            { display: 'Delete', onClick: deleteHomework }
        ]
        createContextMenu(e, listItems, {
            className: 'editdelete'
        });
    }
    return (
        <div className="homeworkHeader">
            <div>
                <span className="date">{prettifyDate(date)}</span>
                <h3>{headline}</h3>
            </div>
            {isStudent || <button onClick={buttonClick}></button>}
        </div>
    );
}

const HomeworkBody = ({ children }) => {
    return (
        <div className="homeworkBody">
            <ul>
                <li className="smol">
                    <div>Assignments</div>
                    <div>Progress</div>
                </li>
            </ul>
            <ol>
                {children}
            </ol>
        </div>
    );
}