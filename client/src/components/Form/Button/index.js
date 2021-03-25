import './Button.css';
import Loading from '../../Loading';

export const Button = ({ type, className, loading, success, children, onClick }) => {
    const statusIcon = (() => {
        if (success) return <SuccessAnimation />;
        if (loading) return <Loading />;
        return null;
    })();
    return (
        <button type={type} className={className ?? ''} onClick={onClick}>
            {statusIcon}
            <span data-ghost={!!statusIcon}>{children}</span>
        </button>
    );
}

const SuccessAnimation = () => {
    return (
        <div className="SuccessAnimation">
            <svg viewBox="0 0 10 10">
                <path d="M5 10 L10 10 L10 0" />
            </svg>
        </div>
    );
}