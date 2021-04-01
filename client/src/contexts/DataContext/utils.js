export const createAvatarObject = (avatarArray = [], wearables, categories) => {
    // the following function converts student.avatar, which is an array of string IDs, to an object with category names as keys
    // first get rid of any null values (e.g. if avatar has default color then 'null' will be among the array values)
    const filteredArray = avatarArray.filter(val => val);
    return filteredArray.reduce((obj, id) => {
        const index = wearables.findIndex(element => element._id === id);
        const { category, _id, name, src, image, occupies } = wearables[index];
        const isColor = !image;
        const occupiedRegions = occupies.map(id => categories.find(item => item._id === id)?.name);
        // if wearable occupies other regions, set those as occupied by wearable's id
        for (let region of occupiedRegions) obj[region] = { isOccupied: id };
        const categoryName = isColor ? 'Color' : categories.find(item => item._id === category).name;
        obj[categoryName] = { _id, name, src, image, occupies };
        return obj;
    }, {});
}