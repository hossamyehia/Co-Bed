const { error } = require('console');
const fs = require('fs');
const {google} = require('googleapis');
const { Readable } = require('stream');

const Image = require('../models/images');

const defaultImage = {
    fieldname: "imageFile",
    originalname: "default.jpeg",
    mimetype: "image/jpeg",
    destination: "/public/images",
    Path: "/public/images/default.jpeg",
    idOnDrive: "10_5PLMwnMSMDnBNoboZbgRo7A4Ot70bO",
    parentId: "1hZwfDidEke35yXro4ZWXzTeRT0ex7A18"
}


const auth = new google.auth.GoogleAuth({
    keyFile: './config/application_credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive']
  });


const drive = google.drive({
  version: 'v3',
  auth: auth
});

const getFileSize = (fileId) => {
  return new Promise((resolve, reject) => {
    drive.files.get({ 
      fileId:fileId,
      fields: "size"
    })
    .then((file) => {
      resolve(file.data.size);
    }).catch(err => {reject(err)});
  })
}

module.exports.newUserFolder = (name) => {
    let parent = {};
    let defaultCover = defaultImage;
    defaultCover.userId = name;
    defaultCover.destination = `public/images/${name}`;
    defaultCover.Path = `${defaultCover.destination}/cover.jpeg`;
    
    let fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [defaultImage.parentId]
    };
    
    drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    })
    .then((file) => {

      parent.id = file.data.id;
      defaultCover.parentId = file.data.id;
      
      fileMetadata = {
        name: 'cover.jpeg',
        mimeType: defaultImage.mimetype,
        parents: [parent.id]
      };

      drive.files.copy({
        resource: fileMetadata,
        fileId: defaultImage.idOnDrive,
        fields: 'id'
      })
      .then((file) => {
      
        defaultCover.idOnDrive = file.data.id;

        drive.files.update({
          fileId: defaultCover.idOnDrive,
          addParents: defaultCover.parentId,
          removeParents: defaultImage.parentId,
          fields: 'id, parents'
        })
        .then((file) => {

          fileMetadata = {
            name: 'posts',
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parent.id]
          };
  
          drive.files.create({
            resource: fileMetadata,
            fields: 'id'
          })
          .then((file) => {
            defaultCover.postsFolderId = file.data.id;
            Image.create(defaultCover)
                    .then((image,err) => {
                      if (err) throw err;
                    })
          }).catch(err => {throw err});
          
        }).catch(err => {throw err});
      
      }).catch(err => {throw err});
         
    }).catch(err => {throw err});
             
}


module.exports.uploadImage = (imageData) => {
  
  let name = imageData.originalname.split(".")[0];
  let userId = imageData.destination.split("/")[2];

  let fileMetadata = {
    name: imageData.originalname,
    mimeType: imageData.mimetype,
  };
   
  Image.findOne({ userId: userId, postImage: false , postId: "" })
      .then((image) => {
        if (!image) {
          const Error = new error("This user doesnot exist in our database");
          console.log(Error);
        }
        else{

          imageData.parentId = image.postsFolderId;
          imageData.postImage = true;
          imageData.postId = name;
          imageData.userId = userId;
          imageData.postsFolderId = image.postsFolderId;

          drive.files.update({
            resource: fileMetadata,
            fileId: imageData.idOnDrive,
            addParents: imageData.parentId,
            removeParents: '1R-d0IsG-SLM99rN5kHaD2-K4wHaCM2BJ',
            fields: 'id, parents'
          })
          .then((file) => {
            imageData.idOnDrive = file.data.id;
            Image.create(imageData)
                .then((image,err) => {
                  if (err) throw err;
                })

          }).catch(err => {throw err});

        }
      }).catch(err => {throw err});

}

module.exports.updateImage = (imageData) => {
  
  let folderName = imageData.destination.split("/")[3];
  let userId = imageData.destination.split("/")[2];
  let name = imageData.originalname.split(".")[0];
  let find = {
    userId: userId
  };

  let fileMetadata = {
    name: imageData.originalname,
    mimeType: imageData.mimetype,
  };
  
  if (folderName){
    find.postId = name;
    find.postImage = true;
    imageData.postId = name;
    imageData.postImage = true;
  }
  else{
    find.postId = "";
    find.postImage = false;
    imageData.postId = "";
    imageData.postImage = false;
  }
  
  Image.findOne(find)
      .then((image) => {
        if (!image){
          this.uploadImage(imageData);
        }
        else{
          
          imageData.userId = userId;
          imageData.parentId = image.parentId;
          imageData.postsFolderId = image.postsFolderId;

          drive.files.delete({
            fileId: image.idOnDrive
          },(err) => {
            if (err) {
              throw err;
            } 
            else {

              drive.files.update({
                resource: fileMetadata,
                fileId: imageData.idOnDrive,
                addParents: imageData.parentId,
                removeParents: '1R-d0IsG-SLM99rN5kHaD2-K4wHaCM2BJ',
                fields: 'id, parents'
              })
              .then((file) => {
                imageData.idOnDrive = file.data.id;
                Image.updateOne(image,imageData)
                    .then((image,err) => {
                      if (err) throw err;
                    })
              }).catch(err => {throw err});
            } 
          });
        }
      }).catch(err => {throw err});
}

module.exports.getImage = (imageDest,imagePath,imageName,userId,res) => {
  
  let folderName = imageDest.split('/')[2];
  let name = imageName.split('.')[0];
  let find = {};

  if (folderName){
    find.userId = userId;
    find.postId = name;
    find.postImage = true;
  }
  else{
    find.userId = userId;
    find.postId = "";
    find.postImage = false;
  }

  Image.findOne(find)
      .then(async(image) => {
        if (!image){
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: "Image does not exist"});
        }
        else{
          
          if(!(fs.existsSync(`public/${imageDest}`)))
            fs.mkdirSync(`public/${imageDest}`, { recursive: true });

          let fileId = image.idOnDrive;
          let dest = fs.createWriteStream(image.Path);

          const fileSize = await getFileSize(fileId)

          res.setHeader("Content-Type", image.mimetype);
          res.setHeader("Content-Length", fileSize);
                  
          drive.files.get({
            fileId: fileId,
            alt: 'media'
          },{responseType: "stream" },(err, file) =>{
              file.data
              .on('end', function () {
                fs.createReadStream(image.Path).pipe(res);
              })
              .on('error', function (err) {
                throw err;
              })
              .pipe(dest); 
          }); 
        }
      }).catch(err => {throw err});
  
}

module.exports.deleteImage = (postId,userId) => {
  
  let find = {};
  find.userId = userId;
  find.postId = postId;
  find.postImage = true;

  Image.findOne(find)
      .then((image) => {
        if (!image){
          const Error = new error("This images doesnot exist in our database");
          console.log(Error);
        }
        else{

          drive.files.delete({
            fileId: image.idOnDrive
          },(err) => {
            if (err) {
              throw err;
            } 
            else{
              Image.deleteOne(image)
            }
          }); 
         
        }
      }).catch(err => {throw err});
  
}



