import { prettifyDate } from "../../utils";
import { Assignment } from "./Assignment"

export const Homework = ({ _id, date, headline, assignments }) => {
    const homeworkAssignments = () => {
        return assignments.map((info, index) => (
            <Assignment key={`homeworkAssignment-${_id}-${index}`} {...info} {...{ index, _id }} />
        ));
    }
    return (
        <div className="Homework">
            <HomeworkHeader {...{ date, headline }} />
            <HomeworkBody>
                {homeworkAssignments()}
            </HomeworkBody>
        </div>
    );
}

const HomeworkHeader = ({ date, headline }) => {
    return (
        <div className="homeworkHeader">
            <div>
                <span className="date">{prettifyDate(date)}</span>
                <h3>{headline}</h3>
            </div>
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