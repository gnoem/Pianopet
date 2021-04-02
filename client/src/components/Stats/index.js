import "./Stats.css";
import { formatNumber } from "../../utils";

export const Stat = ({ children, inline, type }) => {
    const fileName = type === 'coins' ? 'Coin_ico.png' : 'Badge_ico.svg';
    return (
        <span className={`Stat${inline ? ' inline ' : ' '}${type}`}>
            <img alt={`${type} icon`} src={`assets/${fileName}`} />
            <span>{formatNumber(children)}</span>
        </span>
    );
}

export const Coins = ({ children, inline }) => {
    return (
        <Stat type="coins" inline={inline}>
            {children}
        </Stat>
    );
}

export const Badges = ({ children, inline }) => {
    return (
        <Stat type="badges" inline={inline}>
            {children}
        </Stat>
    );
}