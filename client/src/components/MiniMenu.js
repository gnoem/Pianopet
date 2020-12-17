import React, { useEffect, useRef } from 'react';

function MiniMenu(props) {
    const { exit } = props;
    const menu = useRef(null);
    useEffect(() => {
        const closeMenu = (e) => {
            if (!menu.current) return () => {
                window.removeEventListener('click', closeMenu);
            }
            if (!menu.current.contains(e.target)) exit();
        }
        window.addEventListener('click', closeMenu);
        return () => {
            window.removeEventListener('click', closeMenu);
        }
    }, [exit]);
    return (
        <div className="MiniMenu" ref={menu}>
            {props.children}
        </div>
    )
}

export default MiniMenu;