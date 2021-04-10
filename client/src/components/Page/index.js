import "./Page.css";
import { useState, useEffect, useRef, useContext } from "react";
import { DataContext, MobileContext } from "../../contexts";
import { DropdownMenu } from "../Menu";

export const Header = ({ children, view, updateView }) => {
    const { isMobile } = useContext(MobileContext);
    if (isMobile) return (
        <MobileHeader {...{ view, updateView }}>
            {children}
        </MobileHeader>
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

const MobileHeader = ({ children, view, updateView }) => {
    const [expanded, setExpanded] = useState(false);
    const headerRef = useRef(null);
    const navContainer = useRef(null);
    const navShadow = useRef(null);
    useEffect(() => {
        setExpanded(false);
    }, [view]);
    useEffect(() => {
        const { current: navBox } = navContainer;
        const { current: shadow } = navShadow;
        if (!navBox) return;
        if (navBox && shadow) {
            if (expanded) {
                const boxHeight = navBox.scrollHeight + 'px';
                const shadowHeight = navBox.scrollHeight + shadow.scrollHeight + 'px';
                navBox.style.maxHeight = boxHeight;
                shadow.style.maxHeight = shadowHeight;
            } else {
                navBox.style.maxHeight = 0;
                shadow.style.maxHeight = '100%';
            }
        }
        if (!expanded || !headerRef.current) return;
        const closeNav = (e) => {
            if (headerRef.current.contains(e.target)) return;
            setExpanded(false);
        }
        window.addEventListener('click', closeNav);
        return () => window.removeEventListener('click', closeNav);
    }, [expanded]);
    return (
        <div className="Header" ref={headerRef}>
            <div className="Logo">
                <img src="assets/logo.svg" alt="pianopet logo" onClick={() => updateView({ type: 'home' })} />
            </div>
            <button className="stealth" onClick={() => setExpanded(state => !state)}>
                <i className="fas fa-bars"></i>
            </button>
            <div className="navShadow" ref={navShadow}></div>
            <div className="navContainer" ref={navContainer}>
                {expanded && children}
            </div>
        </div>
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

export const ProfileDropdown = ({ isStudent, user, updateView }) => {
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
                <img alt="pfp" src={user?.profilePic || 'assets/defaultpfp.jpg' } />
            </div>
            {showMenu && (
                <DropdownMenu setDropdownMenu={setShowMenu}
                              onSelfDestruct={() => setArrowExpanded(false)}
                              options={{ className: 'hasIcons' }}>
                    <button className="myAccount" onClick={() => updateView({ type: 'my-account' })}>My Account</button>
                    {!isStudent && <button className="settings" onClick={() => updateView({ type: 'settings' })}>Settings</button>}
                    <button className="logout" onClick={logout}>Logout</button>
                </DropdownMenu>
            )}
        </div>
    );
}