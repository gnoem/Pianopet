import React, { useState, useRef, useEffect } from "react";
import { User } from "../../api";
import { createAvatarObject } from "./utils";

export const DataContext = React.createContext(null);

export const DataContextProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [closet, setCloset] = useState(null);
    const userId = useRef(null);
    useEffect(() => { // todo probably can combine this useEffect with below one
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
        fromId: (id) => data?.categories.find(item => item._id === id) ?? colorCategory,
        fromName: (name) => data?.categories.find(item => item.name === name) ?? colorCategory
    }
    const colorCategory = { name: 'Color', _id: '0' };
    const dataContext = {
        ...data,
        refreshData,
        avatar,
        updateAvatar: setAvatar,
        createAvatarObject,
        closet,
        updateCloset: setCloset,
        colorCategory,
        getCategoryObject,
        logout
    };
    return (
        <DataContext.Provider value={dataContext}>
            {children}
        </DataContext.Provider>
    );
}