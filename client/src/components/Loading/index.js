import "./Loading.css";
import { ReactComponent as LoadingIcon } from './Loading.svg';

export const Loading = ({ mini, width, height, style }) => {
    const iconStyle = style ?? {};
    if (width) iconStyle.width = width + 'px';
    if (height) iconStyle.height = height + 'px';
    return (
        <div className={`Loading${mini ? ' mini' : ''}`} style={iconStyle}>
            <LoadingIcon />
        </div>
    );
}