import "./Input.css";
import { useState, useEffect, useRef } from "react";
import { Dropdown } from "../../Dropdown/index.js";

export const Input = ({ type, name, label, className, placeholder, defaultValue, onChange, onInput, note, inputHint, disabled, reset, updateReset }) => {
    const inputRef = useRef(null);
    useEffect(() => {
        if (!reset) return;
        inputRef.current.value = reset.value ?? '';
        updateReset(false);
    }, [reset]);
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
        switch (type) {
            case 'success': {
                className += ' success';
                break;
            }
            case 'error': {
                className += ' error';
                break;
            }
            case 'not-allowed': {
                className += ' not-allowed';
                break;
            }
            default: {}
        }
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
    const icon = (() => {
        switch (type) {
            case 'success': return <i className="fas fa-check"></i>;
            case 'error': return <i className="fas fa-exclamation"></i>;
            case 'not-allowed': return <i className="fas fa-lock"></i>;
            default: return null;
        }
    })();
    return (
        <span className="inputHintIcon" onMouseEnter={() => updateShow(true)} onMouseLeave={() => updateShow(false)}>
            {icon}
        </span>
    );
}