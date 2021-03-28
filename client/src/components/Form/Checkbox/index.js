import "./Checkbox.css";

export const Checkbox = ({ label, checked, onChange }) => {
    return (
        <div className="Checkbox">
            <div className="checkboxElement">
                <input type="checkbox" onChange={onChange} checked={checked} />
                <span className="svg">
                    <svg viewBox="0 0 16 16"><polyline points="3 9 6 12 13 5"></polyline></svg>
                </span>
            </div>
            <label>{label}</label>
        </div>
    );
}