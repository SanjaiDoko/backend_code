"use strict";
const jwt = require("jsonwebtoken")
const fs = require('fs').promises
const common = require('../model/common')
// const db = require('../model/mongodb');
// const { ObjectId } = require("bson");

module.exports.ensureAuthorized = async (req, res, next) => {
    let token, decodedToken, verifyAccessToken, privateKey, checkSessionExist
    if (req.headers.authorization && req.headers.authorization !== '' && req.headers.authorization !== null) {
        token = req.headers.authorization
        token = token.substring(7)
    }
    decodedToken = jwt.decode(token)
    // checkSessionExist = await db.findOneDocumentExists("sessionManagement", { userId: new ObjectId(decodedToken.userId), jwt: token })
    // if(checkSessionExist === false){

    //     return res.status(401).send("Unauthorized")
    // }

    privateKey = await fs.readFile('privateKey.key', 'utf8');
    try {
        verifyAccessToken = jwt.verify(token, privateKey, { algorithms: ["RS256"] })
        let checkAccessAuth = await common.checkUserInDB(verifyAccessToken)
        if ((checkAccessAuth == null || checkAccessAuth.length === 0)) {

            return res.status(401).send("Unauthorized")
        }
        next()
    } catch (error) {
        return res.status(401).send("Unauthorized")
    }
}

