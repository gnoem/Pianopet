import React, { useState } from "react";

export const ModalContext = React.createContext(null);

export const ModalContextProvider = ({ children }) => {
    const [modal, setModal] = useState(null);
    const createModal = (content, type, options) => {
        setModal({
            content: content ?? "😳",
            type: type ?? 'custom',
            options: options ?? {}
        });
    }
    const closeModal = () => setModal(prevState => ({ ...prevState, selfDestruct: true }));
    const switchToModal = (content, type, options) => {
        closeModal();
        setTimeout(() => {
            createModal(content, type, options);
        }, 250);
    }
    const [contextMenu, setContextMenu] = useState(null);
    const createContextMenu = (clickEvent, listItems, options) => {
        setContextMenu({ clickEvent, listItems, options });
    }
    const closeContextMenu = () => setContextMenu(prevState => ({ ...prevState, selfDestruct: true }));
    const modalContext = {
        modal, setModal, createModal, closeModal, switchToModal,
        contextMenu, setContextMenu, createContextMenu, closeContextMenu
    };
    return (
        <ModalContext.Provider value={modalContext}>
            {children}
        </ModalContext.Provider>
    );
}