import { useState, useRef, useEffect } from 'react';

export default function Input(props) {
    const { type, name, label, error, onChange, onInput } = props;
    const inputRef = useRef(null);
    return (
        <div className="Input">
            <label htmlFor={name}>{label}</label>
            <div>
                <input
                    name={name}
                    type={type}
                    className={error ? 'nope' : null}
                    onChange={onChange}
                    onInput={onInput}
                    ref={inputRef}
                />
                <Error error={error} inputRef={inputRef} />
            </div>
        </div>
    );
}

function Error(props) {
    const { error, inputRef } = props;
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
    // calculate width manually
    // set max width of span.message length to input.length (useref) and turn off whitespace nowrap
    if (!error) return null;
    return (
        <div className={`${show ? 'show ' : ''}Error`}>
            <span className="icon" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}><i className="fas fa-exclamation"></i></span>
            {show && <span className="message" ref={messageRef}>{error}</span>}
        </div>
    );
}