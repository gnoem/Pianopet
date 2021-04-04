import React from "react";
import { MobileContext, MobileContextProvider } from "./MobileContext";
import { ModalContext, ModalContextProvider } from "./ModalContext";
import { DataContext, DataContextProvider } from "./DataContext";
import { ViewContext, ViewContextProvider } from "./ViewContext";

const AppContextProvider = ({ children }) => {
    return (
        <MobileContextProvider>
            <ModalContextProvider>
                <DataContextProvider>
                    {children}
                </DataContextProvider>
            </ModalContextProvider>
        </MobileContextProvider>
    );
}

const HomeworkContext = React.createContext(null);

export {
    ModalContext,
    MobileContext,
    DataContext,
    HomeworkContext,
    ViewContext,
    ViewContextProvider,
    AppContextProvider
}