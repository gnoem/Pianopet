import "./Menu.css";
import { useState, useEffect, useContext, useRef } from "react";
import { ModalContext } from "../../contexts";
import { elementHasParent } from "../../utils";

export const Menu = ({ children, type, options = {}, onSelfDestruct, setMenu }) => {
    const { className, style, ignoreClick } = options;
    const [selfDestruct, setSelfDestruct] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const clickedOutside = (e) => {
            if (ignoreClick) {
                for (let selector of ignoreClick) {
                    if (elementHasParent(e.target, selector)) return;
                }
            }
            setSelfDestruct(true);
        }
        window.addEventListener('click', clickedOutside);
        return () => window.removeEventListener('click', clickedOutside);
    }, []);
    useEffect(() => {
        if (!menuRef.current) return;
        if (selfDestruct) {
            menuRef.current.classList.add('goodbye');
            onSelfDestruct?.();
            setTimeout(() => {
                setMenu(null);
            }, 200);
        }
    }, [selfDestruct, menuRef.current]);
    return (
        <div className={`Menu ${type ?? ''} ${className ?? ''}`} style={style} ref={menuRef}> {/* for now */}
            {children}
        </div>
    );
}

export const ContextMenu = ({ clickEvent, listItems, options = {} }) => {
    const { setContextMenu } = useContext(ModalContext); // todo is closeContextMenu obsolete due to new Menu wrapper
    const { className, ignoreClick } = options;
    const calculatePosition = () => {
        const { clientY, clientX } = clickEvent;
        const fromTop = () => {
            return clientY + 8;
        }
        const fromRight = () => {
            const absoluteDistance = window.innerWidth - clientX;
            return absoluteDistance + 8;
        }
        return {
            top: fromTop() + 'px',
            right: fromRight() + 'px'
        }
    }
    const menuOptions = () => {
        // listItems will look something like [{ onClick: someFunction, display: 'Edit' }, { onClick: anotherFunction, display: 'Delete' }]
        return listItems.map(({ display, onClick }) => (
            <button key={`listOption-${display}`} onClick={onClick}>{display}</button>
        ));
    }
    if (!listItems) return null;
    return (
        <Menu type="ctx"
              options={{ className, ignoreClick, style: calculatePosition() }}
              setMenu={setContextMenu}>
            {menuOptions()}
        </Menu>
    );
}

export const DropdownMenu = ({ children, options = {}, onSelfDestruct, setDropdownMenu }) => {
    const { className, ignoreClick } = options;
    return (
        <Menu type="dropdown"
              options={{ className, ignoreClick }}
              onSelfDestruct={onSelfDestruct}
              setMenu={setDropdownMenu}>
            {children}
        </Menu>
    );
}