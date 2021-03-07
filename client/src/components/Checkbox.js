export default function Checkbox(props) {
    const { label, checked, onChange } = props;
    return (
        <div className="Checkbox">
            <div className="checkboxElement">
                <input type="checkbox" onChange={onChange} checked={checked} />
                <span className="svg">
                    <svg viewBox="0 0 12 9"><polyline points="1 5 4 8 11 1"></polyline></svg>
                </span>
            </div>
            <label>{label}</label>
        </div>
    );
}