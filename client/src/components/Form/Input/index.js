import "./Input.css";
import { useState, useEffect, useRef } from "react";
import { Dropdown } from "../../Dropdown/index.js";

export const Input = ({ type, name, label, className, placeholder, defaultValue, onChange, onInput, note, inputHint, disabled }) => {
    const inputRef = useRef(null);
    return (
        <div className="Input">
            {label && <label htmlFor={name}>{label}</label>}
            <div>
                <input
                    type={type}
                    name={name}
                    className={className}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    onInput={onInput}
                    disabled={disabled}
                    ref={inputRef} />
                {inputHint && <InputHint {...inputHint} inputRef={inputRef} />}
            </div>
            {note && <InputNote>{note}</InputNote>}
        </div>
    );
}

export const InputDropdown = ({ name, label, defaultValue, listItems, onChange, addNew, style }) => {
    return (
        <div className="Input">
            {label && <label htmlFor={name}>{label}</label>}
            <Dropdown {...{ name, label, defaultValue, listItems, onChange, addNew, style }} />
        </div>
    );
}

const InputNote = ({ children }) => {
    return <div className="InputNote">{children}</div>
}

const InputHint = ({ type, message, inputRef }) => {
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
    const className = (() => {
        let className = 'InputHint';
        if (type === 'success') className += ' success'; else className += ' error';
        if (show) className += ' show';
        return className;
    })();
    return (
        <div className={className}>
            <InputHintIcon type={type} updateShow={setShow} />
            {show && <span className="inputHintMessage" ref={messageRef}>{message}</span>}
        </div>
    );
}

const InputHintIcon = ({ type, updateShow }) => {
    return (
        <span className="inputHintIcon" onMouseEnter={() => updateShow(true)} onMouseLeave={() => updateShow(false)}>
            {(type === 'success') ? <i className="fas fa-check"></i> : <i className="fas fa-exclamation"></i>}
        </span>
    );
}