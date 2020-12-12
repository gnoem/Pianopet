const prettifyDate = (date) => {
    let prettierDate = date.split('T')[0];
    prettierDate = `${prettierDate.split('-')[1]}/${prettierDate.split('-')[2]}/${prettierDate.split('-')[0]}`
    return prettierDate;
}

export { prettifyDate }