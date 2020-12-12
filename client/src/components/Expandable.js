import React, { useState, useEffect, useRef } from 'react';

function Expandable(props) {
    const { restoreToDefault } = props;
    const [expanded, updateExpanded] = useState(false);
    const expMain = useRef(null);
    useEffect(() => {
        updateExpanded(false);
        expMain.current.style.maxHeight = '0px';
    }, restoreToDefault);
    const toggleExpand = () => {
        updateExpanded(prevExpanded => !prevExpanded);
        if (!expanded) {
            const elementHeight = expMain.current.scrollHeight;
            return expMain.current.style.maxHeight = elementHeight+'px';
        }
        expMain.current.style.maxHeight = '0px';
    }
    return (
        <div className={`Exp ${expanded && 'anded'}`}>
            <div className="ExpHeader" onClick={toggleExpand}>{props.header}</div>
            <div className="ExpMain" ref={expMain}>
                <div className="ExpMainContent">
                    {props.children}
                </div>
            </div>
        </div>
    )
}

export default Expandable;