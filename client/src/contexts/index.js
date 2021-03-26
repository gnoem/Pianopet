import React, { useState, useRef, useEffect } from "react";
import { User } from "../api";

export const ModalContext = React.createContext(null);
export const DataContext = React.createContext(null);
export const ViewContext = React.createContext(null);
export const HomeworkContext = React.createContext(null);

const ModalContextProvider = ({ children }) => {
    const [modal, setModal] = useState(null);
    const createModal = (content, type, options) => {
        setModal({
            content: content ?? "😳",
            type: type ?? 'custom',
            options: options ?? {}
        });
    }
    const closeModal = () => setModal(prevState => ({ ...prevState, selfDestruct: true }));
    const [contextMenu, setContextMenu] = useState(null);
    const createContextMenu = (clickEvent, listItems, options) => {
        setContextMenu({ clickEvent, listItems, options });
    }
    const closeContextMenu = () => setContextMenu(prevState => ({ ...prevState, selfDestruct: true }));
    const modalContext = {
        modal, setModal, createModal, closeModal,
        contextMenu, setContextMenu, createContextMenu, closeContextMenu
    };
    return (
        <ModalContext.Provider value={modalContext}>
            {children}
        </ModalContext.Provider>
    );
}

const DataContextProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [closet, setCloset] = useState(null);
    const userId = useRef(null);
    const createAvatarObject = (avatarArray = [], wearables, categories) => {
        // the following function converts student.avatar, which is an array of string IDs, to an object with category names as keys
        // first get rid of any null values (e.g. if avatar has default color then 'null' will be among the array values)
        const filteredArray = avatarArray.filter(val => val);
        return filteredArray.reduce((obj, id) => {
            const index = wearables.findIndex(element => element._id === id);
            const { category, _id, name, src, image, occupies } = wearables[index];
            const occupiedRegions = occupies.map(id => categories.find(item => item._id === id)?.name);
            // if wearable occupies other regions, set those as occupied by wearable's id
            for (let region of occupiedRegions) obj[region] = { isOccupied: id };
            const categoryName = categories.find(item => item._id === category).name;
            obj[categoryName] = { _id, name, src, image, occupies };
            return obj;
        }, {});
    }
    useEffect(() => {
        if (!data) return;
        if (!data?.isStudent) return;
        const { student, wearables, categories } = data;
        setAvatar(createAvatarObject(student?.avatar, wearables, categories));
    }, [data?.student?.avatar]);
    useEffect(() => {
        if (!data) return;
        const { student, wearables } = data;
        const studentCloset = student.closet.map(_id => { // converting student.closet, which is an array of string IDs, to an array of objects
            const index = wearables.findIndex(element => element._id === _id);
            const thisWearable = wearables[index];
            return thisWearable;
        });
        setCloset(studentCloset);
    }, [data?.student?.closet]);
    const refreshData = async (callback, _id = userId.current) => {
        if (!_id) return console.log('none or null user id');
        userId.current = _id;
        return User.getData(_id).then(data => {
            setData(data);
            callback?.();
            return data;
        }).catch(err => {
            console.log('error at refreshData');
            console.dir(err);
            return err;
        });
    }
    const logout = async () => {
        await fetch(`/logout`).then(() => {
            setTimeout(() => {
                window.location.assign('/');
            }, 500);
        });
    }
    const getCategoryObject = {
        fromId: (id) => data?.categories.find(item => item._id === id),
        fromName: (name) => data?.categories.find(item => item.name === name)
    }
    const dataContext = {
        ...data,
        refreshData,
        avatar,
        updateAvatar: setAvatar,
        createAvatarObject,
        closet,
        updateCloset: setCloset,
        getCategoryObject,
        logout
    };
    return (
        <DataContext.Provider value={dataContext}>
            {children}
        </DataContext.Provider>
    );
}

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
        }
    }
    return (
        <ViewContext.Provider value={viewContext}>
            {children}
        </ViewContext.Provider>
    );
}

export const AppContextProvider = ({ children }) => {
    return (
        <ModalContextProvider>
            <DataContextProvider>
                {children}
            </DataContextProvider>
        </ModalContextProvider>
    );
}