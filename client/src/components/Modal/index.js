//import "./Modal.css";
import { useEffect, useContext, useRef } from "react";
import { DataContext, ModalContext } from "../../contexts";
import { elementHasParent } from "../../utils";
import { formStore } from "./formStore";
import { customDialogStore } from "./Dialog";
import { Error, customErrorStore } from "./Alert";

export const Modal = ({ children, content, type, options, selfDestruct }) => {
    const { ignoreClick } = options;
    const data = useContext(DataContext);
    const { setModal, createModal, closeModal, switchToModal } = useContext(ModalContext);
    const { isStudent, student, teacher } = data;
    const user = isStudent ? student : teacher;
    const formContent = () => {
        switch (type) {
            case 'form': return formStore[content]({ 
                user,
                ...data,
                ...options,
                createModal, //?
                closeModal
            });
            case 'error': return <Error>{content}</Error>;
            case 'customDialog': return customDialogStore[content]({ options, switchToModal });
            case 'customError': return customErrorStore[content]({ options, closeModal });
            default: return content;
        }
    }
    return (
        <ModalWrapper {...{ setModal, closeModal, ignoreClick, selfDestruct }}>
            {children ?? formContent()}
        </ModalWrapper>
    );
}

const ModalWrapper = ({ children, setModal, closeModal, ignoreClick, selfDestruct }) => {
    const modalContainer = useRef(null);
    const modalContent = useRef(null);
    useEffect(() => {
        if (!selfDestruct) return;
        if (modalContainer.current) modalContainer.current.classList.remove('active');
        setTimeout(() => setModal(null), 200);
    }, [selfDestruct]);
    useEffect(() => {
        if (modalContainer.current) setTimeout(() => {
            modalContainer.current.classList.add('active');
        }, 10); // for custom error messages this is necessary for fadein effect!! todo FIGURE OUT WHY AND FIX BETTER!!!!! UGH!!!!!
        const destroyModal = (e) => {
            if (ignoreClick) { // will be an array of selectors like ['button', '#menu li']
                for (let selector of ignoreClick) {
                    if (elementHasParent(e.target, selector)) return;
                }
            }
            if (!modalContent.current) return () => window.removeEventListener('click', destroyModal);
            if (!modalContent.current.contains(e.target)) closeModal();
        }
        window.addEventListener('click', destroyModal);
        return () => window.removeEventListener('click', destroyModal);
    }, []);
    return (
        <div className="Modal" ref={modalContainer}>
            <div className="modalContainer">
                <div className="modalContent" ref={modalContent}>
                    <button className="stealth exit" onClick={closeModal}><i className="fas fa-times"></i></button>
                    {children}
                </div>
            </div>
        </div>
    );
}