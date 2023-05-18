function validateRequest(req, next, schema,res) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: false, // ignore unknown props
        stripUnknown: false // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        res.status(500).send({success: false, message:`Validation error: ${error.details.map(x => x.message).join(', ').replaceAll(/\\/g, '')}`})
    } else {
        req.body = value;
        next();
    }
}

exports.validateRequest = validateRequest