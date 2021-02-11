export const prettifyDate = (date) => {
    let prettierDate = date.split('T')[0];
    prettierDate = `${prettierDate.split('-')[1]}/${prettierDate.split('-')[2]}/${prettierDate.split('-')[0]}`
    return prettierDate;
}

export const elementHasParent = (element, selector) => {
    return element.closest(selector);
}

export const getArrayIndexByKeyValue = (key, value, array) => {
    return array.findIndex(element => element[key] === value);
}