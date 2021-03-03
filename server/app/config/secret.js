const secretKey = async () => {
    const vars = (await import('./vars.js')).default;
    if(process.env.NODE_ENV === 'production')
        return process.env.SECRET_KEY;
    return vars.SECRET_KEY;
}

export default (await secretKey());