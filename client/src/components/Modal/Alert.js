import { Submit } from "../Form";

export const Error = ({ children }) => {
    return (
        <div>
            <h2>Something went wrong</h2>
            {children}
        </div>
    );
}

export const customErrorStore = {
    somethingWentWrong: (props) => <SomethingWentWrong {...props} />
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
                    {error && <code>{JSON.stringify(error)}</code>}
                    {stack && <code className="greyed">[stack]</code>}
                    {stack && <code>{JSON.stringify(stack)}</code>}
                </div>
            </details>
            <Submit value="Send error report" nvm="Close and reload" onCancel={handleCancel} />
        </Error>
    );
}