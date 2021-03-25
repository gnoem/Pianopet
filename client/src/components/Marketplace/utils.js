export const handleUpdatePreview = ([object, setObject], wearables, getCategoryObject) => {
    return ({ category, occupies, _id, name, src, value, image }) => {
        const categoryName = getCategoryObject.fromId(category)?.name ?? category; // in case of default
        const regionsOccupied = (array = occupies) => {
            return array.map(occupiedRegionId => getCategoryObject.fromId(occupiedRegionId)?.name);
        }
        const regionsOccupiedByThisWearable = regionsOccupied(occupies);
        const removeWearableFromPreview = () => {
            const previewObjectMinusCategory = (prevState) => {
                const obj = {...prevState};
                for (let property in prevState) {
                    if (regionsOccupiedByThisWearable.includes(property)) delete obj[property];
                }
                delete obj[categoryName];
                return obj;
            }
            setObject(prevState => ({
                ...previewObjectMinusCategory(prevState)
            }));
            return;
        }
        // when clicking on a wearable that is currently being previewed, i.e. to take it off:
        if (object?.[categoryName]?.name === name) return removeWearableFromPreview();
        // else (when clicking on a wearable to put it on)
        setObject(prevState => {
            // generate empty preview object to write and return as preview object state:
            const obj = {...prevState};
            // if you try to put on a hat and region "head" is occupied by some other wearable,
            // remove that wearable and also remove all the categories it is occupying:
            if (obj[categoryName]?.isOccupied) {
                // get the id of the guilty wearable to find what regions it occupies
                // and remove it, as well as those regions, from preview object
                const guiltyWearable = wearables.find(item => item._id === object[categoryName].isOccupied);
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
            obj[categoryName] = { _id, name, src, value, image, occupies };
            return obj;
        });
    }
}