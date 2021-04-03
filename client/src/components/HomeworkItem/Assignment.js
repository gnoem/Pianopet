import { useState, useContext } from "react";
import { Homework } from "../../api";
import { DataContext, HomeworkContext, ModalContext } from "../../contexts";
import { handleError } from "../../services";

export const Assignment = ({ isStudent, _id, index, label, progress, recorded }) => {
    const [visualProgress, setVisualProgress] = useState(progress);
    const { refreshHomework } = useContext(HomeworkContext);
    const { createModal } = useContext(ModalContext);
    const updateHomeworkProgress = (value) => {
        setVisualProgress(value);
        Homework.updateProgress(_id, { index, value })
            .then(refreshHomework)
            .catch(err => {
                setVisualProgress(progress);
                handleError(err, { createModal });
            });
    }
    return (
        <li>
            <div>
                <div>{label}</div>
                <ProgressIndicator {...{ _id, index, isStudent, visualProgress, recorded, refreshHomework, updateHomeworkProgress }} />
            </div>
        </li>
    );
}

const ProgressIndicator = ({ isStudent, _id, index, visualProgress, recorded, refreshHomework, updateHomeworkProgress }) => {
    const coinsOwed = visualProgress * 20;
    const { refreshData } = useContext(DataContext);
    const { createModal } = useContext(ModalContext);
    const updateRecorded = () => {
        Homework.updateRecorded(_id, { index, recorded: true, coinsOwed })
            .then(() => {
                refreshHomework();
                refreshData();
            })
            .catch(err => {
                handleError(err, { createModal });
            });
    }
    return (
        <div className="ProgressIndicator">
            <div className="progress">
            <button onClick={visualProgress === 0 ? null : () => updateHomeworkProgress(visualProgress - 1)}
                className={`stealth${visualProgress === 0 ? ' disabled' : ''}`}
                style={{ visibility: recorded ? 'hidden' : 'visible' }}><i className="fas fa-minus-circle"></i></button>
            <ProgressBar percentage={(100 * visualProgress) / 4} />
            <button onClick={visualProgress === 4 ? null : () => updateHomeworkProgress(visualProgress + 1)}
                className={`stealth${visualProgress === 4 ? ' disabled' : ''}`}
                style={{ visibility: recorded ? 'hidden' : 'visible' }}><i className="fas fa-plus-circle"></i></button>
            </div>
            {isStudent || (
                <div className={`coinsEarned${recorded ? ' coinsAdded' : ''}`} onClick={recorded ? null : updateRecorded}>
                    <img className="coinIcon" alt="coin icon" src="assets/Coin_ico.png" />
                    <span>{`${coinsOwed}`}</span>
                </div>
            )}
        </div>
    );
}

const ProgressBar = ({ percentage }) => {
    return (
        <div className="ProgressBar">
            <div className="bar" style={{ width: percentage + '%' }}></div>
        </div>
    );
}