import { useState, useEffect, useRef } from 'react';
import Loading from './Loading';

export default function Button(props) {
    const { success, disabled } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [successAnimation, setSuccessAnimation] = useState(false);
    const [buttonDimensions, setButtonDimensions] = useState(null);
    const buttonRef = useRef(null);
    useEffect(() => {
        if (success) {
            setTimeout(() => {
                setLoadingIcon(false);
                setSuccessAnimation(true);
                setTimeout(() => setSuccessAnimation(false), 1500);
            }, 700);
        }
    }, [success]);
    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;
        setButtonDimensions({
            width: button.scrollWidth,
            height: button.scrollHeight
        });
    }, []);
    const handleClick = () => {
        setLoadingIcon(true);
        if (props.onClick) props.onClick();
    }
    const buttonClassName = () => {
        if (successAnimation) return 'successAnimation';
        if (loadingIcon) return 'loadingAnimation';
    }
    if (successAnimation || loadingIcon) return (
        <button type="button" className={buttonClassName()} style={{ width: buttonDimensions.width + 'px', height: buttonDimensions.height + 'px' }}>
            {successAnimation &&
                <svg viewBox="0 0 10 10">
                    <path d="M5 10 L10 10 L10 0" />
                </svg>
            }
            {loadingIcon && <Loading />}
        </button>
    );
    return (
        <button
          type={props.type}
          className={props.className}
          onClick={handleClick}
          disabled={disabled}
          ref={buttonRef}>
            {props.children}
        </button>
    );
}