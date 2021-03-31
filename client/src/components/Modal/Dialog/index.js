import "./Dialog.css";

export const customDialogStore = {
    createWearableOrColor: (props) => <CreateWearableOrColor {...props} />
}

const Dialog = ({ children, title }) => {
    return (
        <div className="Dialog">
            <h2>{title}</h2>
            {children}
        </div>
    );
}

const CreateWearableOrColor = ({ switchToModal }) => {
    const handleClick = (type) => () => {
        switchToModal(type, 'form', {
            cancel: () => switchToModal('createWearableOrColor', 'customDialog')
        });
    }
    return (
        <Dialog title="Create a new wearable">
            <div className="createWearableOrColor">
                <button onClick={handleClick('createWearable')}>
                    <i className="fas fa-tshirt"></i>
                    Clothing or accessory
                </button>
                <button onClick={handleClick('createColor')}>
                    <i className="fas fa-paint-brush"></i>
                    Color
                </button>
            </div>
        </Dialog>
    );
}