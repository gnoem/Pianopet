import { useEffect } from 'react';

export default function ContextMenu(props) {
    useEffect(() => {
        const closeMiniMenu = () => {
            props.updateContextMenu(false);
        }
        window.addEventListener('click', closeMiniMenu);
        return () => window.removeEventListener('click', closeMiniMenu);
    }, []);
    return (
        <div className="ContextMenu" style={props.position}>
            {props.content}
        </div>
    );
}