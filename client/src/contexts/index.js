import React from "react";
import { ModalContext, ModalContextProvider } from "./ModalContext";
import { DataContext, DataContextProvider } from "./DataContext";
import { ViewContext, ViewContextProvider } from "./ViewContext";

const AppContextProvider = ({ children }) => {
    return (
        <ModalContextProvider>
            <DataContextProvider>
                {children}
            </DataContextProvider>
        </ModalContextProvider>
    );
}

const HomeworkContext = React.createContext(null);

export {
    ModalContext,
    DataContext,
    HomeworkContext,
    ViewContext,
    ViewContextProvider,
    AppContextProvider
}