import { useState, useRef, useEffect } from 'react';

export default function Input(props) {
    const { type, name, label, defaultValue, readOnly, disabled, hint, onChange, onInput } = props;
    const { type: hintType, message: hintMessage } = hint;
    const inputClass = hintType === 'error' ? 'nope' : '';
    const inputRef = useRef(null);
    return (
        <div className="Input">
            <label htmlFor={name}>{label}</label>
            <div>
                <input
                    name={name}
                    type={type}
                    defaultValue={defaultValue}
                    readOnly={readOnly}
                    disabled={disabled}
                    className={inputClass}
                    onChange={onChange}
                    onInput={onInput}
                    ref={inputRef}
                />
                <Hint type={hintType} message={hintMessage} />
            </div>
        </div>
    );
}

function Hint(props) {
    const { type, message, inputRef } = props;
    const [show, setShow] = useState(false);
    const messageRef = useRef(null);
    useEffect(() => {
        if (!messageRef.current) return;
        const inputWidth = inputRef?.current?.scrollWidth;
        const messageWidth = messageRef?.current?.scrollWidth;
        if (messageWidth > inputWidth) {
            messageRef.current.style.width = (inputWidth - 22) + 'px';
            messageRef.current.style.whiteSpace = 'normal';
        }
        messageRef.current.style.opacity = '1';
    }, [messageRef, inputRef, show]);
    const showIcon = () => {
        switch (type) {
            case 'success': return <i className="fas fa-check"></i>;
            case 'failure': return <i className="fas fa-exclamation"></i>;
            default: return <i className="fas fa-exclamation"></i>;
        }
    }
    if (!message) return null;
    return (
        <div className={`${show ? 'show ' : ''}${type === 'success' ? 'success ' : 'error '}Hint`}>
            <span className="icon" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>{showIcon()}</span>
            {show && <span className="message" ref={messageRef}>{message}</span>}
        </div>
    );
}