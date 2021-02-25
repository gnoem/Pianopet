import { useState, useEffect, useRef } from 'react';

function Dashboard(props) {
    return (
        <div className={`${(props.teacher) ? 'Teacher' : 'Student'} Dashboard`}>
            {props.children}
        </div>
    )
}

function Header(props) {
    const { isMobile, view } = props;
    const [expanded, setExpanded] = useState(false);
    const navContainer = useRef(null);
    useEffect(() => {
        setExpanded(false);
    }, [view]); // todo this needs to be button click
    useEffect(() => {
        const navBox = navContainer.current;
        if (!navBox) return;
        if (expanded) navBox.style.maxHeight = navBox.scrollHeight + 'px';
        else navBox.style.maxHeight = 0;
    }, [expanded]);
    if (isMobile) return (
        <div className="Header">
            <div className="Logo">
                <img src="assets/logo.svg" alt="pianopet logo" />
            </div>
            <button className="stealth" style={{ lineHeight: '1' }} onClick={() => setExpanded(state => !state)}>
                <i className="fas fa-bars" style={{ fontSize: '1.5rem', marginRight: '0.7rem' }}></i>
            </button>
            <div className="navContainer" ref={navContainer}>
                {expanded && props.children}
            </div>
        </div>
    )
    return (
        <>
            <div className="Logo">
                <img src="assets/logo.svg" alt="pianopet logo" />
            </div>
            <div className="Header">
                {props.children}
            </div>
        </>
    )
}

function Sidebar(props) {
    return (
        <div className="Sidebar">
            {props.children}
        </div>
    )
}

function Nav(props) {
    return (
        <div className="Nav">
            {props.children}
        </div>
    )
}

export { Dashboard, Header, Sidebar, Nav };