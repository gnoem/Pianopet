import "./Guest.css";

export const Guest = ({ children, className }) => {
    return (
        <div className="Guest">
            <div className="hero">
                <img alt="pianopet logo" src="assets/logo.svg" />
            </div>
            <div className={className}>
                {children}
            </div>
        </div>
    );
}