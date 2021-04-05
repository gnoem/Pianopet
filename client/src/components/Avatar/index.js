import "./Avatar.css";
import { useState, useEffect, useContext, useRef } from "react";
import { DataContext, ViewContext } from "../../contexts";
import { Loading } from "../Loading";
import { PianopetBase } from "./PianopetBase";
import { PianopetWallpaper } from "./PianopetWallpaper";

export const Avatar = ({ student, mobilePreview, noClick }) => {
    const { view } = useContext(ViewContext);
    const { isStudent, avatar, createAvatarObject } = useContext(DataContext);
    const [color, setColor] = useState(null);
    const [wallpaper, setWallpaper] = useState(null);
    const [avatarObject, setAvatarObject] = useState(null);
    const { updateView } = useContext(ViewContext);
    const avatarContainerRef = useRef(null);
    const avatarBoxRef = useRef(null);
    const updateAvatarObject = (obj) => {
        setAvatarObject(obj);
        setWallpaper(obj?.Wallpaper);
        setColor(obj?.Color?.src);
    }
    useEffect(() => {
        if (mobilePreview) return updateAvatarObject(mobilePreview);
        if (avatar) return updateAvatarObject(avatar);
    }, [mobilePreview, avatar]);
    useEffect(() => {
        const obj = createAvatarObject(student?.avatar);
        updateAvatarObject(obj);
    }, [student, view]);
    useEffect(() => {
        if (!mobilePreview) return;
        const { current: avatarContainer } = avatarContainerRef;
        const { current: avatarBox } = avatarBoxRef;
        if (!avatarContainer) return;
        const availableVerticalSpace = avatarContainer.scrollHeight;
        if (avatarBox) {
            const mainDiv = avatarContainer.parentNode;
            const computedValue = (availableVerticalSpace > mainDiv.clientWidth)
                ? mainDiv.clientWidth
                : availableVerticalSpace;
            const containerSize = computedValue;
            const boxSize = containerSize - 10; // 2 * 5px border on container
            avatarContainer.style.width = containerSize + 'px';
            avatarContainer.style.height = containerSize + 'px';
            avatarContainer.style.borderWidth = '5px';
            avatarBox.style.width = boxSize + 'px';
            avatarBox.style.height = boxSize + 'px';
            mainDiv.style.alignItems = 'center';
        }
    }, [avatarContainerRef.current]);
    const handleClick = () => {
        if (noClick) return;
        if (isStudent) updateView({ type: 'closet' });
    }
    const generateAvatar = () => {
        if (avatarObject === null) return <Loading />;
        return Object.keys(avatarObject).map(key => {
            if (['Color', 'Wallpaper'].includes(key)) return null;
            if (avatarObject[key].isOccupied) return null;
            const { _id, src, image } = avatarObject[key];
            const style = {
                top: `${image?.y}%`,
                left: `${image?.x}%`,
                width: `${image?.w}%`
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
        <div className={`Avatar${mobilePreview ? ' mobilePreview' : ''}`} ref={avatarContainerRef}>
            <div className="avatarBox" onClick={handleClick} ref={avatarBoxRef}>
                <PianopetWallpaper {...wallpaper} />
                <PianopetBase color={color} />
                {generateAvatar()}
            </div>
        </div>
    );
}

export const MobileAvatarPreview = ({ student, mobilePreview }) => {
    return (
        <Avatar {...{
            student,
            mobilePreview,
            noClick: true
        }} />
    );
}