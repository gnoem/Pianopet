import { useEffect } from 'react';
import { elementHasParent } from '../utils';

export default function ContextMenu(props) {
    useEffect(() => {
        const closeContextMenu = (e) => {
            if (props.ignoreClick) {
                for (let selector of props.ignoreClick) {
                    if (elementHasParent(e.target, selector)) return;
                }
            }
            props.updateContextMenu(false);
        }
        window.addEventListener('click', closeContextMenu);
        return () => window.removeEventListener('click', closeContextMenu);
    }, []);
    return (
        <div className="ContextMenu" style={props.position}>
            {props.content}
        </div>
    );
}