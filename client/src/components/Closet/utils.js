export const createAvatarObjectForUpdate = ({ _id, name, src, image, avatar, wearables, occupies, categoryName, getCategoryObject }) => {
    const regionsOccupied = (array = occupies) => {
        return array.map(occupiedRegionId => getCategoryObject.fromId(occupiedRegionId)?.name);
    }
    const regionsOccupiedByThisWearable = regionsOccupied(occupies);
    const isTakingOffWearable = avatar[categoryName]?._id === _id;
    const avatarObjectMinusThisWearable = () => {
        const previewObjectMinusCategory = (prevState) => {
            const obj = {...prevState};
            for (let property in prevState) {
                if (regionsOccupiedByThisWearable.includes(property)) delete obj[property];
            }
            delete obj[categoryName];
            return obj;
        }
        return previewObjectMinusCategory(avatar);
    }
    if (isTakingOffWearable) return avatarObjectMinusThisWearable();
    const avatarObject = () => {
        // generate empty object to write and return as avatar object:
        const obj = {...avatar};
        // if you try to put on a hat and region "head" is occupied by some other wearable,
        // remove that wearable and also remove all the categories it is occupying:
        if (obj[categoryName]?.isOccupied) {
            // get the id of the guilty wearable to find what regions it occupies
            // and remove it, as well as those regions, from avatar object
            const guiltyWearable = wearables.find(item => item._id === avatar[categoryName].isOccupied);
            const regionsOccupiedByGuiltyWearable = regionsOccupied(guiltyWearable.occupies);
            // remove guilty wearable
            const guiltyWearableCategory = getCategoryObject.fromId(guiltyWearable.category)?.name;
            delete obj[guiltyWearableCategory];
            // remove occupied regions
            for (let region of regionsOccupiedByGuiltyWearable) delete obj[region];
        }
        // look at obj[categoryName] /before/ resetting it, to see if it is occupying any other regions and then remove those:
        /* otherwise, if wearing e.g. full body crab suit, which occupies head/face/accessory, and you put on
        a different body item, head/face/accessory remain occupied by full body crab suit */
        const prevWearable = obj[categoryName];
        if (prevWearable) {
            const regionIds = prevWearable.occupies ?? [];
            const regionsOccupiedByPrevWearable = regionsOccupied(regionIds);
            for (let region of regionsOccupiedByPrevWearable) delete obj[region];
        }
        // if the wearable you are trying to preview occupies any regions,
        // then set those regions to { isOccupied: thisWearableId }
        for (let region of regionsOccupiedByThisWearable) obj[region] = { isOccupied: _id };
        // set the actual wearable
        obj[categoryName] = { _id, name, src, image };
        return obj;
    }
    return avatarObject();
}