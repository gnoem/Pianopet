import React, { useState, useRef, useEffect } from "react";
import { User } from "../../api";
import { returnCreateAvatarObject } from "./utils";

export const DataContext = React.createContext(null);

export const DataContextProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [closet, setCloset] = useState(null);
    const userId = useRef(null);
    const createAvatarObject = data
        ? returnCreateAvatarObject(data.wearables, data.categories)
        : null;
    useEffect(() => { // todo probably can combine this useEffect with below one
        if (!data) return;
        if (!data?.isStudent) return;
        const { student } = data;
        setAvatar(createAvatarObject(student?.avatar));
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
    const colorCategory = { name: 'Color', _id: '0' };
    const wallpaperCategory = { name: 'Wallpaper', _id: '1' };
    const allCategories = data ? [...data?.categories, colorCategory, wallpaperCategory] : [];
    const getCategoryObject = {
        fromId: (id) => allCategories.find(item => item._id === id),
        fromName: (name) => allCategories.find(item => item.name === name)
    }
    const dataContext = {
        ...data,
        refreshData,
        avatar,
        updateAvatar: setAvatar,
        createAvatarObject,
        closet,
        updateCloset: setCloset,
        colorCategory,
        wallpaperCategory,
        getCategoryObject,
        logout
    };
    return (
        <DataContext.Provider value={dataContext}>
            {children}
        </DataContext.Provider>
    );
}