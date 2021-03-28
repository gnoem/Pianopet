import "./Page.css";
import { useState, useEffect, useRef, useContext } from "react";
import { DataContext, ModalContext } from "../../contexts";
import { DropdownMenu } from "../Menu";

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
    const [showMenu, setShowMenu] = useState(false);
    const [arrowExpanded, setArrowExpanded] = useState(false);
    /* ^^^ this is stupid and I wish arrow up/down could just be equal to the value of showMenu but there's a 0.2s delay between the menu shrinking animation and when "showMenu" is set to false, so this is what we're doing instead */ 
    const { logout } = useContext(DataContext);
    useEffect(() => {
        if (showMenu) setArrowExpanded(true);
        else setArrowExpanded(false);
    }, [showMenu]);
    const toggleMenu = () => setShowMenu(prevState => !prevState);
    return (
        <div className={`User ${arrowExpanded ? ' expanded' : ''}`}>
            <button onClick={toggleMenu}>
                <span className="name">{user.firstName}</span>
                <span className="caret"></span>
            </button>
            <div className="pfp" onClick={toggleMenu}>
                <img alt="pfp" src={user?.profilePic ?? 'assets/defaultpfp.jpg' } />
            </div>
            {showMenu && (
                <DropdownMenu setDropdownMenu={setShowMenu}
                              onSelfDestruct={() => setArrowExpanded(false)}
                              options={{ className: 'hasIcons' }}>
                    <button className="myAccount" onClick={() => updateView({ type: 'my-account' })}>My Account</button>
                    <button className="settings" onClick={() => updateView({ type: 'settings' })}>Settings</button>
                    <button className="logout" onClick={logout}>Logout</button>
                </DropdownMenu>
            )}
        </div>
    );
}