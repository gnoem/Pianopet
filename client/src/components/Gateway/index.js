import { useState, useEffect, useContext } from "react";
import { User } from "../../api";
import { ModalContext, ViewContextProvider } from "../../contexts";
import { handleError } from "../../services";
import { ContextMenu } from "../Menu";
import { Dashboard } from "../Dashboard";
import { Guest } from "../Guest";
import { Modal } from "../Modal";

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
        <>
            {modal && <Modal {...modal} />}
            {contextMenu && <ContextMenu {...contextMenu} />}
            {(accessToken === false)
                ? <Guest {...{ handleSuccess }} />
                : <ViewContextProvider>
                    <Dashboard {...{ userId, isStudent, accessToken }} />
                 </ViewContextProvider>
            }
        </>
    );
}