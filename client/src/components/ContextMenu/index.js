import "./ContextMenu.css";
import { useContext, useEffect, useRef } from "react";
import { ModalContext } from "../../contexts";
import { elementHasParent } from "../../utils";

export const ContextMenu = ({ clickEvent, listItems, options = {}, selfDestruct }) => {
    const { setContextMenu, closeContextMenu } = useContext(ModalContext);
    const { className, ignoreClick } = options;
    const contextMenuRef = useRef(null);
    useEffect(() => {
        const closeMenu = (e) => {
            if (ignoreClick) {
                for (let selector of ignoreClick) {
                    if (elementHasParent(e.target, selector)) return;
                }
            }
            closeContextMenu();
        }
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);
    useEffect(() => {
        if (!contextMenuRef.current) return;
        if (selfDestruct) {
            contextMenuRef.current.classList.add('goodbye');
            setTimeout(() => {
                setContextMenu(null);
            }, 200);
        }
    }, [selfDestruct, contextMenuRef.current]);
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
    if (!listItems) return;
    return (
        <div className={`ContextMenu ${className ?? ''}`} style={calculatePosition()} ref={contextMenuRef}>
            {menuOptions()}
        </div>
    );
}