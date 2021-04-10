import "./Account.css";
import { useContext } from "react";
import { DataContext } from "../../contexts";
import { AccountDetails, ChangePassword } from "./forms"

export const Account = () => {
    const { demo, student, teacher, isStudent, refreshData } = useContext(DataContext);
    return (
        <div className="MyAccount">
            <h1>My Account</h1>
            <AccountDetails
                user={student ?? teacher}
                {...{ demo, isStudent, refreshData }} />
            <ChangePassword
                user={student ?? teacher}
                {...{ demo, isStudent, refreshData }}/>
        </div>
    );
}

export { ChangePassword }