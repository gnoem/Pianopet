import { ReactComponent as LoadingIcon } from './Loading.svg';

function Loading(props) {
    const { mini, width, height, style } = props;
    const iconStyle = style ?? {};
    if (width) iconStyle.width = width + 'px';
    if (height) iconStyle.height = height + 'px';
    return (
        <div className={`Loading${mini ? ' mini' : ''}`} style={iconStyle}>
            <LoadingIcon />
        </div>
    )
}

export default Loading;