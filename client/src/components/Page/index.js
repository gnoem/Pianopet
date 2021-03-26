import { useState, useEffect, useRef, useContext } from 'react';
import { DataContext } from '../../contexts';

export const Header = ({ children, /* isMobile, */ view, updateView }) => {
    const isMobile = false;
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
                <img src="assets/logo.svg" alt="pianopet logo" onClick={() => updateView({ type: 'home' })} />
            </div>
            <button className="stealth" style={{ lineHeight: '1' }} onClick={() => setExpanded(state => !state)}>
                <i className="fas fa-bars" style={{ fontSize: '1.5rem', marginRight: '0.7rem' }}></i>
            </button>
            <div className="navContainer" ref={navContainer}>
                {expanded && children}
            </div>
        </div>
    );
    return (
        <>
            <div className="Logo">
                <img src="assets/logo.svg" alt="pianopet logo" onClick={() => updateView({ type: 'home' })} />
            </div>
            <div className="Header">
                {children}
            </div>
        </>
    );
}

export const Sidebar = ({ children }) => {
    return (
        <div className="Sidebar">
            {children}
        </div>
    )
}

export const Nav = ({ children }) => {
    return (
        <div className="Nav">
            {children}
        </div>
    )
}

export const ProfileDropdown = ({ user, updateView }) => {
    const [expanded, setExpanded] = useState(false);
    const { logout } = useContext(DataContext);
    const toggleExpanded = () => setExpanded(prevState => !prevState);
    return (
        <div className={`User ${expanded ? ' expanded' : ''}`}>
            <button onClick={toggleExpanded}>
                <span className="name">{user.firstName}</span>
                <span className="caret"></span>
            </button>
            <div className="pfp" onClick={toggleExpanded}>
                <img alt="pfp" src={user.profilePic ? user.profilePic : 'assets/defaultpfp.jpg' } />
            </div>
            {/* <ContextMenu
              position={null}
              ignoreClick={['.User .pfp', '.User > button']}
              updateContextMenu={() => setExpanded(false)}
              children={(
                <ul>
                    <li><button className="myAccount" onClick={() => updateView({ type: 'account' })}>My Account</button></li>
                    <li><button className="settings" onClick={() => updateView({ type: 'settings' })}>Settings</button></li>
                    <li><button className="logout" onClick={logout}>Logout</button></li>
                </ul>
            )} /> */}
        </div>
    );
}