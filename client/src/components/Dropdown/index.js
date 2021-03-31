import "./Dropdown.css";
import { useEffect, useRef, useState } from "react";
import { elementHasParent } from "../../utils";

export const Dropdown = ({ defaultValue, listItems, restoreDefault, onChange, addNew, style, error }) => {
    const [display, setDisplay] = useState(() => {
        if (!listItems || !listItems.length) return 'Add new...';
        if (!defaultValue) return 'Select one';
        return defaultValue.display;
    });
    const [isOpen, setIsOpen] = useState(false);
    const [hasScrollbar, setHasScrollbar] = useState(false);
    const [addingNew, setAddingNew] = useState(false);
    const dropdownContainer = useRef(null);
    const dropdownList = useRef(null);
    useEffect(() => {
        const closeDropdown = (e) => {
            if (elementHasParent(e.target, '.dropdownDisplay')) return;
            if (elementHasParent(e.target, '.addNew')) return;
            setIsOpen(false);
        }
        window.addEventListener('click', closeDropdown);
        return () => window.removeEventListener('click', closeDropdown);
    }, []);
    const dropdownMaxHeight = (dropdown) => {
        const distanceFromTop = dropdown?.getBoundingClientRect().top;
        const elementHeight = dropdown?.scrollHeight;
        if (distanceFromTop + elementHeight < window.innerHeight) return elementHeight + 1; // + 1px to offset 1px bottom border on dropdown element
        setHasScrollbar(true);
        return (window.innerHeight - distanceFromTop) - 24; // -24 for some wiggle room
    }
    useEffect(() => {
        if (!dropdownList.current) return;
        dropdownList.current.style.maxHeight = isOpen ? dropdownMaxHeight(dropdownList.current) + 'px' : '0px';
        if (!isOpen) setAddingNew(false); // unrelated to maxHeight adjustment thing
    }, [isOpen, addingNew]);
    useEffect(() => {
        if (addingNew && hasScrollbar) {
            dropdownList.current?.scrollTo({
                top: dropdownMaxHeight(dropdownList.current),
                left: 0,
                behavior: 'smooth'
            });
        }
    }, [addingNew, hasScrollbar]);
    useEffect(() => {
        if (restoreDefault) setDisplay(defaultValue?.display ?? 'Select one');
    // defaultValue is guaranteed to stay the same during the lifetime of this component so I think it's safe to include here?
    // but maybe read up on if it's better to eslint-disable-next-line instead
    }, [restoreDefault, defaultValue?.display]);
    const toggleIsOpen = () => setIsOpen(prevState => !prevState);
    const generateList = () => {
        const buttonForAddNew =
            <AddNew key="dropdownItem-addNew"
                {...{
                    addNew,
                    addingNew,
                    updateAddingNew: setAddingNew,
                    updateIsOpen: setIsOpen,
                    updateDisplay: setDisplay
                }}
            />;
        if ((!listItems || !listItems.length) && addNew) return buttonForAddNew;
        const array = [];
        for (let { display, value } of listItems) {
            const handleClick = (e) => {
                setDisplay(display);
                onChange(value);
            }
            array.push(
                <li className="dropdownItem" key={`dropdownItem-${display}`}>
                    <button type="button" onClick={handleClick}>{display}</button>
                </li>
            );
        }
        if (addNew) array.push(buttonForAddNew);
        return array;
    }
    return (
        <div className={`Dropdown${isOpen ? ' expanded' : ''}${hasScrollbar ? ' scrollable' : ''}`}>
            <div style={style} ref={dropdownContainer}>
                <div className="dropdownDisplay" onClick={toggleIsOpen}>{display}</div>
                <ul className="dropdownList" ref={dropdownList}>{generateList()}</ul>
            </div>
            {error && <span className="error" style={{ maxWidth: `${dropdownList.current?.scrollWidth}px` ?? 'auto' }}>{error}</span>}
        </div>
    );
}

const AddNew = ({ addNew, addingNew, updateAddingNew, updateIsOpen, updateDisplay }) => {
    const [inputValue, setInputValue] = useState(null);
    const [inputError, setInputError] = useState(null);
    const inputRef = useRef(null);
    useEffect(() => {
        if (!addingNew) return setInputValue(null);
        inputRef.current.focus();
        const handleKeydown = (e) => {
            if (e.key === 'Escape') return updateAddingNew(false);
            if (e.key === 'Enter') {
                e.preventDefault();
                addNew(inputRef.current.value)
                    .then(result => {
                        updateDisplay(result);
                        updateIsOpen(false);
                        setInputError(null);
                    })
                    .catch(setInputError);
            }
        }
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [addingNew]);
    return (
        <li className="dropdownItem">
            {addingNew
                ?   <button type="button" className="addNew active">
                        <input
                            ref={inputRef}
                            type="text"
                            defaultValue={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onInput={() => setInputError(null)}
                        />
                        {inputError
                            ? <span className="inputHint error">{inputError}</span>
                            : <span className="inputHint">Press Enter to submit, Esc to cancel.</span>}
                    </button>
                :   <button type="button" className="addNew" onClick={() => updateAddingNew(true)}>
                        Add new...
                    </button>
                }
        </li>
    );
}

export const StudentDropdown = ({ students, onChange, error, defaultValue, restoreDefault }) => {
    const studentList = students.map(({ _id, firstName, lastName }) => ({
        value: _id,
        display: `${firstName} ${lastName}`
    }))
    return (
        <Dropdown
            style={{ minWidth: '15rem' }}
            defaultValue={defaultValue ?? { value: null, display: 'Select one...' }}
            listItems={studentList}
            onChange={onChange}
            restoreDefault={restoreDefault}
            error={error} />
    );
}