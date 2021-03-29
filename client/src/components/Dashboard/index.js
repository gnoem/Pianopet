import { useState, useEffect, useContext } from "react";
import { DataContext } from "../../contexts";
import Loading from "../Loading";
import { Student } from "../Student/index.js";
import { Teacher } from "../Teacher/index.js";

export const Dashboard = ({ userId, isStudent }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const { refreshData } = useContext(DataContext);
    useEffect(() => {
        refreshData(null, userId).then(success => {
            if (success) setIsLoaded(true);
        });
    }, [userId]);
    if (!isLoaded) return <Loading />;
    return (
        <div className={`Dashboard ${isStudent ? 'Student' : 'Teacher'}`}>
            {isStudent && <Student />}
            {(isStudent === false) && <Teacher />}
        </div>
    );
}