const fs = require('fs');
const {google} = require('googleapis');

const Image = require('../models/images');

const defaultImage = {
    fieldname: "imageFile",
    originalname: "default.png",
    mimetype: "image/png",
    destination: "/public/images",
    Path: "/public/images/default.png",
    idOnDrive: "1fklE4PWaGBETImSE4UXXJa2nXF9sUzV0",
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



module.exports.newUserFolder = (name) => {
    let parent = {};
    let defaultCover = defaultImage;
    defaultCover.userId = name;
    
    let fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [defaultImage.parentId]
    };
    
    drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    },(err, file) => {
      if (err) {
        throw err;
      }
      else{
        parent.id = file.data.id;
        defaultCover.parentId = file.data.id;
        
        fileMetadata = {
          name: 'cover.png',
          mimeType: defaultImage.mimetype,
          parents: [parent.id]
        };

        drive.files.copy({
          resource: fileMetadata,
          fileId: defaultImage.idOnDrive,
          fields: 'id'
        },(err, file) => {
          if (err) {
            throw err;
          }
          else{
            defaultCover.idOnDrive = file.data.id;
            
            drive.files.update({
              fileId: defaultCover.idOnDrive,
              addParents: defaultCover.parentId,
              removeParents: defaultImage.parentId,
              fields: 'id, parents'
            },(err, file) => {
              if (err) throw err; 
            });
          }
        });
        

        fileMetadata = {
          name: 'posts',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parent.id]
        };

        drive.files.create({
          resource: fileMetadata,
          fields: 'id'
        },(err, file) => {
          if (err) {
            throw err;
          }
          else{
            defaultCover.postsFolderId = file.data.id;
            Image.create(defaultCover)
                    .then((image,err) => {
                      if (err) throw err;
                    })
          }
        });
      }
    });
             
}


module.exports.uploadImage = (imageData) => {
  
  let folderName = imageData.destination.split("/")[3];
  let name = imageData.originalname.split(".")[0];
  let userId;

  let fileMetadata = {
    name: imageData.originalname,
    writersCanShare: true
  };
  let media = {
    mimeType: imageData.mimeType,
    body: fs.createReadStream(imageData.Path)
  };

  if (folderName){
    userId = imageData.destination.split("/")[2];
    imageData.postImage = true;
    imageData.postId = name;
  }
  else{
    userId = imageData.destination.split("/")[2];    
  }

  Image.findOne({ userId: userId, postImage: false , postId: "" })
      .then((image, err) => {
        if (err) throw err
        else{
          if (folderName == "posts"){
            fileMetadata.parents = [image.postsFolderId];
            imageData.parentId = image.postsFolderId;
          }
          else{
            fileMetadata.parents = [image.parentId];
            imageData.parentId = image.parentId;   
          }

          imageData.userId = userId;
          imageData.postsFolderId = image.postsFolderId;

          drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
          },(err, file) => {
            if (err) {
              throw err;
            } 
            else {
              imageData.idOnDrive  = file.data.id;
              Image.create(imageData)
                  .then((image,err) => {
                    if (err) throw err;
                  })
            }
          })
        }
      });

}

module.exports.updateImage = (imageData) => {
  
  let folderName = imageData.destination.split("/")[2];
  let userId = imageData.destination.split("/")[1]
  let name = imageData.originalname.split(".")[0];
  let find = {};

  let fileMetadata = {
    name: imageData.originalname,
    writersCanShare: true
  };
  let media = {
    mimeType: imageData.mimeType,
    body: fs.createReadStream(imageData.path)
  };

  if (folderName){
    find.userId = userId;
    find.postId = name;
    find.postImage = true;
    imageData.userId = userId;
    imageData.postId = name;
    imageData.postImage = true;
  }
  else{
    find.userId = userId;
    find.postId = "";
    find.postImage = false;
    imageData.userId = userId;
    imageData.postId = "";
    imageData.postImage = false;
  }

  Image.findOne(find)
      .then((image, err) => {
        if (err){
          this.uploadImage(imageData);
        }
        else{
          fileMetadata.parents = [image.parentId];
          imageData.parentid = image.parentId;
          imageData.postsFolderId = image.postsFolderId;

          drive.files.delete({
            fileId: image.idOnDrive
          },(err) => {
            if (err) {
              throw err;
            } 
            else {

              drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
              },(err, file) => {
                  if (err) {
                    throw err;
                  } 
                  else {
                    imageData.onDriveId  = file.data.id;
                    Image.updateOne(image,imageData)
                        .then((image,err) => {
                          if (err) throw err;
                        })
                  }
                });
            } 
          
          });
        }
      });
}

module.exports.getImage = (imageDest,imagePath,imageName,userId) => {
  
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
  console.log(find);

  Image.findOne(find)
      .then((image, err) => {
        if (err){
          return new Promise(resolve => {resolve(false);});
        }
        else{
          
          if(fs.existsSync(`public/${imageDest}`))
            fs.mkdirSync(`public/${imageDest}`, { recursive: true });

          let fileId = image.idOnDrive;
          let dest = fs.createWriteStream(imagePath);

          return new Promise((resolve,reject) => {
            drive.files.get({
              fileId: fileId,
              alt: 'media'
            },{responseType: "stream" },(err, {data}) =>{
                data
                .on('end', function () {
                  resolve(true);
                })
                .on('error', function (err) {
                  reject(err)
                })
                .pipe(dest); 
            });
          }); 
        }
      });
  
}

module.exports.deleteImage = (postId,userId) => {
  
  let filePath = `/public/images/${userId}/posts/${postId}.json`;

  if(fs.existsSync(filePath)){
    fs.readFile(filePath, 'utf8' , (err, data) => {
      if (err){
          throw err;
      } 
      else {
        ImageData = JSON.parse(data);
          
        drive.files.delete({
          fileId: ImageData.idOnDrive
        },(err) => {
          if (err) {
            throw err;
          } 
          else{
            fs.rmSync(filePath, { recursive: true });
          }
        }); 
      }
    });
  }
}



