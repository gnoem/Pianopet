import "./Stats.css";
import { formatNumber } from "../../utils";

export const Stat = ({ children, inline, type, onClick }) => {
    const fileName = type === 'coins' ? 'Coin_ico.png' : 'Badge_ico.svg';
    return (
        <span className={`Stat${inline ? ' inline ' : ' '}${type}${onClick ? ' clickable' : ''}`} onClick={onClick}>
            <img alt={`${type} icon`} src={`assets/${fileName}`} />
            <span>{formatNumber(children)}</span>
        </span>
    );
}

export const Coins = ({ children, inline, onClick }) => {
    return (
        <Stat type="coins" inline={inline} onClick={onClick}>
            {children}
        </Stat>
    );
}

export const Badges = ({ children, inline, onClick }) => {
    return (
        <Stat type="badges" inline={inline} onClick={onClick}>
            {children}
        </Stat>
    );
}