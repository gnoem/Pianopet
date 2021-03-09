import { useState, useEffect } from 'react';
import Loading from './Loading';
import PianopetBase from './PianopetBase';

export default function Avatar(props) {
    const { viewingAsTeacher, avatar } = props;
    const [color, setColor] = useState(null);
    useEffect(() => {
        if (!avatar) return;
        setColor(avatar.Color?.src);
    }, [avatar]);
    const handleClick = () => {
        if (!viewingAsTeacher) props.updateView({ type: 'closet' });
    }
    const generateAvatar = () => {
        if (avatar === null) return <Loading />;
        return Object.keys(avatar).map(key => {
            if (key === 'Color') return null;
            if (avatar[key].isOccupied) return null;
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
            <div className="avatarBox" onClick={handleClick}>
                <PianopetBase color={color} />
                {generateAvatar()}
            </div>
        </div>
    );
}