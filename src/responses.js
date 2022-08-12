// standard responses to send

const basicOkResponse = (data) => {
    return {
        success: true,
        data,
    }
}

const errorResponse = (err) => {
    return {
        success: false,
        data: err,
    }
};

module.exports = {
    basicOkResponse,
    errorResponse,
}
