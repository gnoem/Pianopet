import { useEffect, useRef, useState } from 'react';
import { elementHasParent } from '../utils';

export default function Dropdown(props) {
    const { defaultValue, listItems } = props;
    const [display, setDisplay] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownList = useRef(null);
    useEffect(() => {
        const closeDropdown = (e) => {
            if (elementHasParent(e.target, '.dropdownDisplay')) return;
            setIsOpen(false);
        }
        window.addEventListener('click', closeDropdown);
        return () => window.removeEventListener('click', closeDropdown);
    }, []);
    useEffect(() => {
        if (!dropdownList || !dropdownList.current) return;
        if (isOpen) dropdownList.current.style.maxHeight = dropdownList.current.scrollHeight + 1 + 'px'; // plus 1px to account for 1px bottom border
        else dropdownList.current.style.maxHeight = '0px';
    }, [isOpen]);
    const toggleIsOpen = () => setIsOpen(prevState => !prevState);
    const handleClick = (e) => {
        setDisplay(e.target.innerHTML);
        props.onChange(e.target.innerHTML);
    }
    const generateList = () => {
        const array = [];
        for (let item of listItems) {
            array.push(
                <li className="dropdownItem" key={`dropdownItem-${item}`}>
                    <button type="button" onClick={handleClick}>{item}</button>
                </li>
            );
        }
        return array;
    }
    return (
        <div className={`Dropdown${isOpen ? ' expanded' : ''}`}>
            <div className="dropdownDisplay" onClick={toggleIsOpen}>{display}</div>
            <ul className="dropdownList" ref={dropdownList}>{generateList()}</ul>
        </div>
    );
}