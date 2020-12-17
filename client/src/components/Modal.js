import React, { useEffect, useRef } from 'react';

function Modal(props) {
    const { exit } = props;
    const modalContent = useRef(null);
    useEffect(() => {
        const exitModal = (e) => {
            if (!modalContent.current) return () => {
                window.removeEventListener('click', exitModal);
            }
            if (!modalContent.current.contains(e.target)) exit();
        }
        window.addEventListener('click', exitModal);
        return () => {
            window.removeEventListener('click', exitModal);
        }
    }, [exit]);
    return (
        <div className="Modal">
            <div className="modalContainer">
                <div className="modalContent" ref={modalContent}>
                    <button className="stealth exit" onClick={props.exit}><i className="fas fa-times"></i></button>
                    {props.children}
                </div>
            </div>
        </div>
    )
}

export default Modal;