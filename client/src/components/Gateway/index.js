import { useState, useEffect, useContext } from "react";
import { User } from "../../api";
import { ModalContext, ViewContextProvider } from "../../contexts";
import { handleError } from "../../services";
import { ContextMenu } from "../Menu";
import { Dashboard } from "../Dashboard";
import { AccountAccess } from "../AccountAccess";
import { Modal } from "../Modal";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

export const Gateway = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isStudent, setIsStudent] = useState(null);
    const { modal, createModal, contextMenu } = useContext(ModalContext);
    useEffect(() => {
        User.auth().then(handleSuccess).catch(err => {
            setAccessToken(false);
            handleError(err, { createModal });
        });
    }, []);
    const handleSuccess = ({ token, isStudent, _id }) => {
        setUserId(_id);
        setIsStudent(isStudent)
        setAccessToken(token);
    }
    return (
        <Router>
            {modal && <Modal {...modal} />}
            {contextMenu && <ContextMenu {...contextMenu} />}
            <Switch>
                <Route path="/:userType/recovery/:recoveryToken">
                    <AccountAccess {...{ type: null, action: 'recovery', handleSuccess, createModal }} />
                </Route>
                <Route path="/signup">
                    <AccountAccess {...{ type: 'student', action: 'signup', handleSuccess, createModal }} />
                </Route>
                <Route path="/">
                {(accessToken === false)
                    ? <AccountAccess {...{ handleSuccess, createModal }} />
                    : <ViewContextProvider>
                        <Dashboard {...{ userId, isStudent, accessToken }} />
                      </ViewContextProvider>
                }
                </Route>
            </Switch>
        </Router>
    );
}