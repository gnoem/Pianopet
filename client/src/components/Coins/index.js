import "./Coins.css";
import { formatNumber } from "../../utils";

export const Coins = ({ children, inline }) => {
    return (
        <span className={`Coins${inline ? ' inline' : ''}`}>
            <img alt="coin icon" src="assets/Coin_ico.png" />
            <span>{formatNumber(children)}</span>
        </span>
    );
}