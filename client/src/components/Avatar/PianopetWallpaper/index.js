import "./PianopetWallpaper.css";

export const PianopetWallpaper = ({ src, image }) => {
    const createStyle = (image = {
        type: 'color',
        size: 100
    }) => {
        const { type, size } = image;
        const obj = {};
        switch (type) {
            case 'color': {
                obj.backgroundColor = src;
                break;
            }
            case 'gradient': {
                obj.backgroundImage = src;
                break;
            }
            case 'image': {
                obj.backgroundImage = `url(${src})`;
                obj.backgroundSize = `${size ?? 100}%`;
                break;
            }
            default: {
                obj.backgroundColor = src;
            }
        }
        return obj;
    }
    return (
        <div className="Wallpaper" style={createStyle(image)}></div>
    );
}