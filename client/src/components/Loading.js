import { ReactComponent as LoadingIcon } from './Loading.svg';

function Loading(props) {
    const { width, height } = props;
    const style = {};
    if (width) style.width = width + 'px';
    if (height) style.height = height + 'px';
    return (
        <div className={`Loading${height ? ' mini' : ''}`} style={style}>
            <LoadingIcon />
        </div>
    )
}

export default Loading;