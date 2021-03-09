import React, { useEffect, useRef } from 'react';
import { elementHasParent } from '../utils';

function Modal(props) {
    const { exit } = props;
    const modalContainer = useRef(null);
    const modalContent = useRef(null);
    useEffect(() => {
        if (!modalContainer) return;
        modalContainer.current.classList.add('active');
    }, []);
    useEffect(() => {
        const exitModal = (e) => {
            if (props.ignoreClick) { // will be an array like ['.Modal', '#menu li']
                console.log('ignoring clicks from', props.ignoreClick)
                for (let selector of props.ignoreClick) {
                    if (elementHasParent(e.target, selector)) return;
                }
            }
            if (!modalContent.current) return () => {
                window.removeEventListener('click', exitModal);
            }
            if (!modalContent.current.contains(e.target)) {
                exit();
            }
        }
        window.addEventListener('click', exitModal);
        return () => {
            window.removeEventListener('click', exitModal);
        }
    }, [exit]);
    return (
        <div className="Modal" ref={modalContainer}>
            <div className="modalContainer">
                <div className="modalContent" ref={modalContent}>
                    <button className="stealth exit" onClick={props.exit}><i className="fas fa-times"></i></button>
                    {props.children}
                </div>
            </div>
        </div>
    );
}

export default Modal;