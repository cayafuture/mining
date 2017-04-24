
/**
 * A rate-limiting Throttle record, by IP address
 * models/throttle.js
 */
var Throttle,
    mongoose = require('mongoose'),
    config = require('../config'),
    Schema = mongoose.Schema;
    mongoose.Promise = global.Promise;
Throttle = new Schema({
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: config.rateLimit.ttl // (60 * 10), ten minutes
    },
    ip: {
        type: String,
        required: true,
        trim: true
    },
    hits: {
        type: Number,
        default: 0,
        required: true,
        max: config.rateLimit.max, // 600
        min: 0
    }
});

Throttle.index({ createdAt: 1  }, { expireAfterSeconds: config.rateLimit.ttl });
module.exports = mongoose.model('Throttle', Throttle);