import React, { useEffect, useRef } from 'react';

function MiniMenu(props) {
    const menu = useRef(null);
    useEffect(() => {
        const closeMenu = (e) => {
            if (!menu.current) return () => {
                window.removeEventListener('click', closeMenu);
            }
            if (!menu.current.contains(e.target)) props.exit();
        }
        window.addEventListener('click', closeMenu);
        return () => {
            window.removeEventListener('click', closeMenu);
        }
    }, []);
    return (
        <div className="MiniMenu" ref={menu}>
            {props.children}
        </div>
    )
}

export default MiniMenu;