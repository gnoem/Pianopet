import { Submit } from "../Form";

export const Alert = ({ children }) => {
    return (
        <div className="Alert">
            {children}
        </div>
    )
}

export const Error = ({ children }) => {
    return (
        <Alert>
            <h2>Something went wrong</h2>
            {children}
        </Alert>
    );
}

export const customAlertStore = {
    demoAlert: (props) => <DemoAlert {...props} />,
    somethingWentWrong: (props) => <SomethingWentWrong {...props} />
}

const DemoAlert = ({ closeModal }) => {
    return (
        <Alert>
            <h2>Welcome to Pianopet!</h2>
            <p>It looks like you got here via a link on my portfolio. If you're visiting this app as a student or teacher, you can exit this popup and log in like you normally would.</p>
            <p>I've set up special accounts for visitors who are here to demo Pianopet. Log in with the username <b>student</b> to view the app as a student or as <b>teacher</b> to view the app as a teacher. The password for both accounts is <b>pianopet</b>.</p>
            <div className="buttons">
                <button onClick={closeModal}>Got it</button>
            </div>
        </Alert>
    );
}

const SomethingWentWrong = ({ options, closeModal }) => {
    const { status, message, error, stack } = options;
    const handleCancel = () => {
        closeModal();
        setTimeout(() => window.location.assign('/'), 200);
    }
    return (
        <Error>
            <p>Please help me improve this app by submitting an error report!</p>
            <details>
                <summary>Error details</summary>
                <div className="errorDetails">
                    <code>Error {status}: {message}</code>
                    {error && <code>"{error}"</code>}
                    {stack && <code className="greyed">[stack]</code>}
                    {stack && <code>{JSON.stringify(stack)}</code>}
                </div>
            </details>
            <Submit value="Send error report" nvm="Close and reload" cancel={handleCancel} />
        </Error>
    );
}