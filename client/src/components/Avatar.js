import Loading from './Loading';

export default function Avatar(props) {
    const { student, avatar } = props;
    const generateAvatar = () => {
        if (avatar === null) return <Loading />;
        if (!Object.keys(avatar).length) return (
            <img alt={`${student.firstName}'s avatar`} src="assets/defaultpianopet.png" className="default" />
        );
        return Object.keys(avatar).map(key => {
            const { _id, src } = avatar[key]; 
            return (
                <img key={`studentAvatar-${key}-${_id}`} alt={src} src={src} className={key} />
            );
        });
    }
    return (
        <div className="Avatar">
            {generateAvatar()}
        </div>
    );
}