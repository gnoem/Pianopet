import { useState } from 'react';
import Loading from './Loading';

export default function Button(props) {
    const [loadingIcon, setLoadingIcon] = useState(false);
    const handleClick = () => {
        setLoadingIcon(true);
        props.onClick();
    }
    if (loadingIcon) return <Loading />;
    return (
        <button onClick={handleClick}>
            {props.children}
        </button>
    );
}