import Loading from './Loading';

export default function Avatar(props) {
    const { student, avatar } = props;
    const generateAvatar = () => {
        if (avatar === null) return <Loading />;
        return Object.keys(avatar).map(key => {
            const { _id, src, image } = avatar[key];
            const style = {
                top: `${image.y}%`,
                left: `${image.x}%`,
                width: `${image.w}%`
            }
            return (
                <img
                  key={`studentAvatar-${key}-${_id}`}
                  className={`${key} avatarItem`}
                  alt={src}
                  src={src}
                  style={style} />
            );
        });
    }
    return (
        <div className="Avatar">
            <div className="avatarBox" onClick={() => props.updateView('closet')}>
                <img alt={`${student.firstName}'s avatar`} src="https://i.imgur.com/RJ9U3wW.png" className="previewBase" />
                {generateAvatar()}
            </div>
        </div>
    );
}