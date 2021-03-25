import { useState, useEffect, useContext } from "react";
import { User } from "../../api";
import { ModalContext, ViewContextProvider } from "../../contexts";
import { handleError } from "../../services";
import { Dashboard } from "../Dashboard/index.js";
import { Guest } from "../Guest/index.js";
import { Modal } from "../Modal/index.js";

export const Gateway = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isStudent, setIsStudent] = useState(null);
    const { modal, createModal } = useContext(ModalContext);
    useEffect(() => {
        User.auth().then(handleSuccess).catch(err => {
            console.log('fix proxy error idiot!!!', err);
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
            {(accessToken === false)
                ? <Guest {...{ handleSuccess }} />
                : <ViewContextProvider>
                    <Dashboard {...{ userId, isStudent, accessToken }} />
                 </ViewContextProvider>
            }
        </>
    );
}