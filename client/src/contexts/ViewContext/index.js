import React, { useState } from "react";

export const ViewContext = React.createContext(null);

export const ViewContextProvider = ({ children }) => {
    const [view, setView] = useState({ type: 'home' });
    const viewContext = {
        view,
        updateView: setView,
        currentNote: view?.currentNote,
        updateCurrentNote: (note) => {
            setView(prevView => ({
                ...prevView,
                currentNote: note
            }));
        },
        unsavedChanges: view?.unsavedChanges,
        updateUnsavedChanges: (value) => {
            setView(prevView => ({
                ...prevView,
                unsavedChanges: value
            }));
        },
        updateCurrentStudent: (student) => {
            setView(prevView => ({
                ...prevView,
                student
            }));
        }
    }
    return (
        <ViewContext.Provider value={viewContext}>
            {children}
        </ViewContext.Provider>
    );
}