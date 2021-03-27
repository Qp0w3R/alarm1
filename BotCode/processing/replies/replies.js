const Languages = Object.freeze({
    general: "general",
    RU: "ru",
    EN: "en"
});

/**@param {Languages} language */
function LoadReplies(language) {
    return require(`${__dirname}/${language}.json`);
}

module.exports = {
    Languages,
    LoadReplies
}