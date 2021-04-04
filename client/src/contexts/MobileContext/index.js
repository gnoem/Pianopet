import React, { useState, useEffect, useCallback } from "react";

export const MobileContext = React.createContext(null);

export const MobileContextProvider = ({ children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const resize = useCallback(() => {
        if (!isMobile && window.innerWidth <= 900) return setIsMobile(true);
        if (isMobile && window.innerWidth > 900) return setIsMobile(false);
        // not debouncing since setIsMobile is called conditionally
    }, [isMobile]);
    useEffect(() => {
        window.addEventListener('resize', resize);
        return () => window.addEventListener('resize', resize);
    }, [resize]);
    return (
        <MobileContext.Provider value={{ isMobile }}>
            {children}
        </MobileContext.Provider>
    );
}