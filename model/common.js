//Imports
const db = require('./mongodb')
const bcrypt = require('bcrypt')
// const { ShareServiceClient } = require("@azure/storage-file-share")
const fs = require('fs').promises
// const logger = require('../model/logger')(__filename)
// const CONFIG = require('../config/config')
// var CONFIGJSON = require('../config/config.json')
const jwt = require('jsonwebtoken')
const path = require('path')
// const CryptoJS = require("crypto-js")
const { message } = require('./message')
// const { ObjectId } = require('bson')
// const ejs = require('ejs')
const fsRead = require('fs')
// const { transporter } = require('./mail')
// const imagePath = path.join(__dirname, "/../public/assets", "allmastersbanner.png");
// let mailResendAttempts = 2

//convert the reading file to base64

function getImageAsBase64(imagePath) {
  const imageBuffer = fsRead.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString('base64');
  const imageExtension = imagePath.split('.').pop();
  return `data:image/${imageExtension};base64,${imageBase64}`;
}

//Forgot Password Mail
const forgotPasswordMail = async (mailData) => {

  // let templatePathUser = path.resolve('../templates/user/')
  ejs.renderFile("./templates/user/forgotPassword.ejs",
    {
      fullName: mailData.fullName,
      email: mailData.emailTo,
      url: mailData.url,
      linkdinUrl: mailData.linkdinUrl,
      instaUrl: mailData.instaUrl,
      otp: mailData.otp,
      logoUrl:getImageAsBase64(imagePath)
    }
    , (err, data) => {
      if (err) {
        console.log(err);
      } else {
        let mailOptions = {
          from: process.env.SMTP_AUTH_USER,
          to: mailData.emailTo,
          subject: `AllMasters | Attention! Password Reset Request`,
          html: data
        }

        //Send Mail
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            if (mailResendAttempts !== 0) {
              forgotPasswordMail(mailData)
              mailResendAttempts--
            } else {
              mailResendAttempts = 2
            }
            logger.error(`Mail Not Sent - ${error}`)
            return console.log(error)
          }
          logger.info(`Mail sent:  - ${info.messageId}`)
        })
      }
    })
}

async function deleteFilesInFolder(filePath, folderName) {

  const shareServiceClient = ShareServiceClient.fromConnectionString(CONFIG.AZURECONNECTIONSTRING);
  const shareName = CONFIGJSON.azureFilePath.shareName
  const shareClient = shareServiceClient.getShareClient(shareName);
  const shareExists = await shareClient.exists()

  if (shareExists) {
    if (filePath.includes('app') === true) {                        //For Dev, Qa, Uat Environments
      fileHierarchyPath = filePath.split("/fileuploads/").pop()
    }
    else {                                                          //Only for Local API Work
      fileHierarchyPath = filePath.split("\\fileuploads\\").pop()
    }
    fileHierarchy = fileHierarchyPath.substring(0, fileHierarchyPath.indexOf("/"))

    if (fileHierarchy === 'cfs certificates') {

      directoryName = CONFIGJSON.azureFilePath.directory + `/CFS Certificates/${folderName}`
    }

    const directoryClient = shareClient.getDirectoryClient(directoryName);

    const files = directoryClient.listFilesAndDirectories();
    for await (const file of files) {
      if (file.kind === "file") {
        await directoryClient.getFileClient(file.name).deleteIfExists();
      }
    }
  }
}


//Azure File Share Upload - uploadFileAzure(filePath, lclbookingId, fileNamePath)
const uploadFileAzure = async (filePath, folderName, fileNamePath) => {
  let serviceClient, shareName, shareClient, shareExists,
    fileHierarchyPath, fileHierarchy, directoryName, directoryClient, directoryExists,
    fileName, fileClient, directoryFolderExists, directoryFolder, fileDirectory

  const azureConnectionString = CONFIG.AZURECONNECTIONSTRING
  if (!azureConnectionString) throw Error('Azure Storage ConnectionString not found');

  try {
    serviceClient = ShareServiceClient.fromConnectionString(azureConnectionString)

    //Azure File Share
    shareName = CONFIGJSON.azureFilePath.shareName
    shareClient = serviceClient.getShareClient(shareName);
    shareExists = await shareClient.exists()
    // await shareClient.create();           -    To Create Azure Share Client if not exists. Legacy Now as Azure Share Client Already Exists

    if (shareExists) {
      //Finding the File Hierarchy to determine the Directory Name to Upload the File in Azure File Share
      if (filePath.includes('app') === true) {                        //For Dev, Qa, Uat Environments
        fileHierarchyPath = filePath.split("/fileuploads/").pop()
      }
      else {                                                          //Only for Local API Work
        fileHierarchyPath = filePath.split("\\fileuploads\\").pop()
      }
      fileHierarchy = fileHierarchyPath.substring(0, fileHierarchyPath.indexOf("/"))

      //Azure File Share Directory
      if (fileHierarchy === 'registration') {
        fileDirectory = CONFIGJSON.azureFilePath.directory + '/Registration'
        directoryFolder = shareClient.getDirectoryClient(fileDirectory)
        directoryFolderExists = await directoryFolder.exists()
        if (!directoryFolderExists) { await directoryFolder.create() }

        directoryName = CONFIGJSON.azureFilePath.directory + `/Registration/${folderName}`
      }
      else if (fileHierarchy === 'cfs certificates') {
        fileDirectory = CONFIGJSON.azureFilePath.directory + '/CFS Certificates'
        directoryFolder = shareClient.getDirectoryClient(fileDirectory)
        directoryFolderExists = await directoryFolder.exists()
        if (!directoryFolderExists) { await directoryFolder.create() }

        directoryName = CONFIGJSON.azureFilePath.directory + `/CFS Certificates/${folderName}`
      }
      else if (fileHierarchy === 'origin forwarder') {
        fileDirectory = CONFIGJSON.azureFilePath.directory + '/Origin Forwarder'
        directoryFolder = shareClient.getDirectoryClient(fileDirectory)
        directoryFolderExists = await directoryFolder.exists()
        if (!directoryFolderExists) { await directoryFolder.create() }

        directoryName = CONFIGJSON.azureFilePath.directory + `/Origin Forwarder/${folderName}`
      }
      else if (fileHierarchy === 'booking') {
        fileDirectory = CONFIGJSON.azureFilePath.directory + '/Booking'
        directoryFolder = shareClient.getDirectoryClient(fileDirectory)
        directoryFolderExists = await directoryFolder.exists()
        if (!directoryFolderExists) { await directoryFolder.create() }

        directoryName = CONFIGJSON.azureFilePath.directory + `/Booking/${folderName}`
      }
      else if (fileHierarchy === 'milestone pdf') {
        fileDirectory = CONFIGJSON.azureFilePath.directory + '/Milestone pdf'
        directoryFolder = shareClient.getDirectoryClient(fileDirectory)
        directoryFolderExists = await directoryFolder.exists()
        if (!directoryFolderExists) { await directoryFolder.create() }

        directoryName = CONFIGJSON.azureFilePath.directory + `/Milestone pdf/${folderName}`
      }

      directoryClient = shareClient.getDirectoryClient(directoryName)
      directoryExists = await directoryClient.exists()

      if (!directoryExists) { await directoryClient.create() }

      //Azure File Share File
      fileName = fileNamePath
      fileClient = directoryClient.getFileClient(fileName)
      await fileClient.uploadFile(filePath)
    }
  }
  catch (error) {
    logger.error('Error in Azure File Share Connection: ' + error.message + '')
  }
}

//Azure File Share Download - downloadFileAzure(lclbookingId)
const downloadFileAzure = async (folderName, fileToDownload, type) => {
  let serviceClient, shareName, shareClient, shareExists,
    directoryName, directoryClient, directoryExists,
    fileName, fileClient, fileUploadsPath, filePath,
    fileDownloadBuffer, allfiles = []

  fileUploadsPath = path.resolve(__dirname, '../fileuploads')
  filePath = `${fileUploadsPath}/${type}/${folderName}/`
  await fs.mkdir(filePath, { recursive: true }, (err) => {
    if (err) throw err;
  })

  const azureConnectionString = CONFIG.AZURECONNECTIONSTRING
  if (!azureConnectionString) throw Error('Azure Storage ConnectionString not found');

  try {
    serviceClient = ShareServiceClient.fromConnectionString(azureConnectionString)

    //Azure File Share
    shareName = CONFIGJSON.azureFilePath.shareName
    shareClient = serviceClient.getShareClient(shareName);
    shareExists = await shareClient.exists()
    // await shareClient.create();

    //Azure File Share Directory
    if (shareExists) {
      directoryName = CONFIGJSON.azureFilePath.directory + `/${type}/${folderName}`
      directoryClient = shareClient.getDirectoryClient(directoryName)
      directoryExists = await directoryClient.exists()

      if (directoryExists) {
        const dirIter = directoryClient.listFilesAndDirectories()
        let i = 1;
        for await (const item of dirIter) {
          if (item.kind === "directory") {
            console.log(`${i} - directory\t: ${item.name}`);
          } else {
            //Azure File Share File Download to Server
            // console.log(`${i} - file\t: ${item.name}`);
            if (fileToDownload !== "") {
              if (fileToDownload === item.name) {
                fileName = item.name
                fileClient = directoryClient.getFileClient(fileName)
                fileDownloadBuffer = await fileClient.downloadToBuffer()

                return "data:application/pdf;base64," + Buffer.from(fileDownloadBuffer).toString('base64')
              }

            }
            else {
              fileName = item.name
              fileClient = directoryClient.getFileClient(fileName)
              fileDownloadBuffer = await fileClient.downloadToBuffer()
              allfiles.push({ fileName, filePath: "data:application/pdf;base64," + Buffer.from(fileDownloadBuffer).toString('base64') })
            }
          }
          i++;
        }
        return allfiles
      }
    }
  }
  catch (error) {
    logger.error('Error in Azure File Share Connection: ' + error.message + '');
    data.response = error.message;
    res.send(data);
  }
}

//Create Milestone Directory - createDir(fileuploadpath)
const createDir = async (path) => {
  await fs.mkdir(path, { recursive: true }, (err) => {
    if (err) throw err;
  });
}

//Create Milestone File - createMilestoneFile(`${filePath}/${lclbookingId}/${fileName}`, base64Pdf, 'base64')
const createFile = async (filePath, fileData, fileEncoding) => {
  await fs.writeFile(filePath, fileData, { encoding: fileEncoding })
}

const hasDuplicates = (array) => {
  var valuesSoFar = [];
  for (var i = 0; i < array.length; ++i) {
    var value = array[i];
    if (valuesSoFar.indexOf(value) !== -1) {
      return true
    }
    valuesSoFar.push(value);
  }
  return false;
}

const duplicate = (arr, keys) => {
  let store = []
  let duplicate
  arr.map((el) => {
    let str = ""
    keys.forEach((e) => {
      str += el[e]
    })
    if (!store.includes(str)) {
      store.push(str)
    } else {
      duplicate = true
    }
  })
  if (duplicate) {
    return true
  }
}

const otpGenerate = () => {
  let otp = Math.random().toString().substring(2, 8)
  if (otp.length !== 6) {
    otpGenerate()
  } else {
    return otp
  }
}

const encryptDB = (data) => {
  var ciphertext = CryptoJS.AES.encrypt(`${JSON.stringify(data)}`, CONFIG.DB_KEY).toString();
  if (ciphertext) {
    return ciphertext
  }
}

const decryptDB = (data) => {
  bytes = CryptoJS.AES.decrypt(data, CONFIG.DB_KEY);
  data = bytes.toString(CryptoJS.enc.Utf8);
  data = JSON.parse(data)
  return data
}

const encryptAPI = (data) => {
  var ciphertext = CryptoJS.AES.encrypt(`${JSON.stringify(data)}`, CONFIG.API_KEY).toString();
  if (ciphertext) {
    return ciphertext
  }
}

function checkMaliciousFile(fileObject, filePathKey) {
  const fileNameArray = fileObject.fileName.split(".")
  const fileExt = `${fileNameArray[fileNameArray.length - 1]}`.toLowerCase()
  let checkCondition = true
  if (fileObject[filePathKey].includes("base64")) {
    checkCondition = fileObject[filePathKey].includes("application/pdf;base64")
  }
  else {
    checkCondition = fileObject[filePathKey].endsWith(".pdf") || fileObject[filePathKey].endsWith(".PDF")
  }
  return fileExt === "pdf" && checkCondition
}

const decryptAPI = (data) => {
  bytes = CryptoJS.AES.decrypt(data, CONFIG.API_KEY);
  data = bytes.toString(CryptoJS.enc.Utf8);
  data = JSON.parse(data)
  return data
}


// const loginAttempts = new Map()
// let maxAttempts = 3

const loginParameter = async (model, loginData, res, req) => {
  let user, passwordMatch, generatedToken, loginTime, updateLogIn, attempts, privateKey, otp, otpAdd, checkSession

  privateKey = await fs.readFile('privateKey.key', 'utf8');
   user = await db.findSingleDocument(model, { "email": loginData.email, status: 1 })
  if (user !== null && Object.keys(user).length !== 0) {
    if (user.password !== undefined) {                        // && (user.logoutTime === undefined || user.logoutTime !== null)
      passwordMatch = bcrypt.compareSync(loginData.password, user.password);
      if (passwordMatch === true) {
        // checkSession = await db.findOneDocumentExists("sessionManagement", { userId: new ObjectId(user._id) })
        // if (checkSession === true) {

        //   return res.send({ status: 0, response: message.alreadyLogin, data: user._id })
        // }
        generatedToken = jwt.sign({
          userId: user._id,
          role: user.role,
          status: user.status,
          type: loginData.type,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
        }, privateKey, { algorithm: 'RS256' })
        res.setHeader('Authorization', 'Bearer ' + generatedToken)

        loginTime = Date.now()
        updateLogIn = await db.updateOneDocument(model, { _id: user._id }, { loginTime: loginTime, logoutTime: "" })
        if (updateLogIn.modifiedCount !== 0 && updateLogIn.matchedCount !== 0) {
          // loginAttempts.set(loginData.email, 0)
          // await db.insertSingleDocument("sessionManagement", { userId: user._id, jwt: generatedToken })
          return res.send({
            status: 1,
            response: message.login,
            data: JSON.stringify({
              userId: user._id,
              token: generatedToken,
            })
          })
        }
      } else {
        if(model && model !== "internal"){
          // if (loginAttempts.has(loginData.email) && loginAttempts.get(loginData.email) >= maxAttempts) {

          //   return res.send({ status: 0, response: message.loginExceeded })
          // }
          // attempts = loginAttempts.get(loginData.email) || 0;
          // loginAttempts.set(loginData.email, attempts + 1)
          // if (attempts + 1 >= maxAttempts) {
          //   otp = otpGenerate()
          //   if (model && model == "user") {
          //     otpAdd = await db.findOneAndUpdate('user', { _id: new ObjectId(user._id) }, { pwOtp: otp })
          //     await forgotPasswordMail({
          //       emailTo: user.email,
          //       fullName: user.fullName,
          //       url: CONFIGJSON.settings.changePasswordUrl + user._id + "/1",
          //       linkdinUrl: CONFIGJSON.settings.linkdinUrl,
          //       instaUrl: CONFIGJSON.settings.instaUrl,
          //       otp: otpAdd._doc.pwOtp
          //     })
          //   } else if (model && model == "cfs") {
          //     otpAdd = await db.findOneAndUpdate('cfs', { _id: new ObjectId(user._id) }, { pwOtp: otp })
          //     await forgotPasswordMail({
          //       emailTo: user.email,
          //       fullName: user.fullName,
          //       url: CONFIGJSON.settings.changePasswordUrl + user._id + "/2",
          //       linkdinUrl: CONFIGJSON.settings.linkdinUrl,
          //       instaUrl: CONFIGJSON.settings.instaUrl,
          //       otp: otpAdd._doc.pwOtp
          //     })
          //   }
  
          //   return res.send({ status: 0, response: message.loginExceeded })
          // }
        }
        else{

          return res.send({ status: 0, response: message.wrongPassword });
        }

        res.send({ status: 0, response: message.wrongPassword });
      }
    }
    else {
      if (user.password === undefined) {

        return res.send({ status: 0, response: message.userNotFound })
      }

      return res.send({ status: 0, response: message.wrongPassword });
    }
  }
  else {

    return res.send({ status: 0, response: message.loginFailed })
  }
}

const checkUserInDB = async ({ userId, role, status, type }) => {
  switch (type) {
    case 1:
      return await db.findSingleDocument("user", {
        _id: new ObjectId(userId),
        role: role,
        status: status,
      })
    case 2:
      return await db.findSingleDocument("cfs", {
        _id: new ObjectId(userId),
        role: role,
        status: status,
      })
    case 3:
      return await db.findSingleDocument("internal", {
        _id: new ObjectId(userId),
        role: role,
        status: status,
      })
  }
}

const logoutParameter = async (model, logoutData, res, req) => {
  let logoutTime, updateLogOut

  logoutTime = Date.now()
  updateLogOut = await db.updateOneDocument(model, { _id: new ObjectId(logoutData.id) }, { logoutTime: logoutTime })
  if (updateLogOut.modifiedCount !== 0 && updateLogOut.matchedCount !== 0) {
    await db.deleteOneDocument("sessionManagement", { userId: new ObjectId(logoutData.id) })
    return res.send({
      status: 1,
      response: message.logoutSucess
    })
  }
  else {

    return res.send({ status: 0, response: message.invalidCredential })
  }
}

const checkAccess = function (role) {
  return async (req, res, next) => {
    try {
      let token, privateKey, verifyAccessToken
      if (req.headers.authorization && req.headers.authorization !== '' && req.headers.authorization !== null) {
        token = req.headers.authorization
        token = token.substring(7)
      }
      privateKey = await fs.readFile('privateKey.key', 'utf8');
      if (!token) {

        return res.status(401).send("Unauthorized Access")
      }

      try {

        verifyAccessToken = jwt.verify(token, privateKey, { algorithms: ["RS256"] })

      } catch (error) {
        return res.status(401).send("Unauthorized Access")
      }
      if (role.includes(verifyAccessToken.role) === false) {

        return res.status(401).send("Unauthorized Access")
      }
      next();
    }
    catch (error) {
      next(error)
    }
  }
}


module.exports = {
  uploadFileAzure,
  downloadFileAzure,
  createDir,
  createFile,
  hasDuplicates,
  duplicate,
  otpGenerate,
  encryptDB,
  decryptDB,
  encryptAPI,
  decryptAPI,
  loginParameter,
  logoutParameter,
  checkMaliciousFile,
  checkUserInDB,
  checkAccess,
  deleteFilesInFolder,
  getImageAsBase64
}

