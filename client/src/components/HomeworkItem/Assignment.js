import { useState, useContext } from "react";
import { Homework } from "../../api";
import { HomeworkContext, ModalContext } from "../../contexts";
import { handleError } from "../../services";

export const Assignment = ({ _id, index, label, progress, recorded }) => {
    const [visualProgress, setVisualProgress] = useState(progress);
    const { refreshHomework } = useContext(HomeworkContext);
    const { createModal } = useContext(ModalContext);
    const updateHomeworkProgress = async (value) => {
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
                <ProgressIndicator {...{ visualProgress, recorded, updateHomeworkProgress }} />
            </div>
        </li>
    );
}

const ProgressIndicator = ({ visualProgress, recorded, updateHomeworkProgress }) => {
    const updateRecorded = () => {
        console.log('clicked  record assignment progress');
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
            <div className={`coinsEarned${recorded ? ' coinsAdded' : ''}`} onClick={recorded ? null : updateRecorded}>
                <img className="coinIcon" alt="coin icon" src="assets/Coin_ico.png" />
                <span>{`${visualProgress * 20}`}</span>
            </div>
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