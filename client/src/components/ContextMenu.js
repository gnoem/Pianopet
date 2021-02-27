import { useEffect } from 'react';
import { elementHasParent } from '../utils';

export default function ContextMenu(props) {
    useEffect(() => {
        const closeContextMenu = (e) => {
            if (props.ignoreClick) { // will be an array like ['.Modal', '#menu li']
                for (let selector of props.ignoreClick) {
                    if (elementHasParent(e.target, selector)) return;
                }
            }
            props.updateContextMenu(false);
        }
        window.addEventListener('click', closeContextMenu);
        return () => window.removeEventListener('click', closeContextMenu);
    // eslint-disable-next-line
    }, []); // pretty sure closeContextMenu and its own dependencies will never change during the lifetime of this component
    return (
        <div className="ContextMenu" style={props.position}>
            {props.children}
        </div>
    );
}