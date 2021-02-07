const fs = require('fs');
const {google} = require('googleapis');

const User = require('../models/users');
const Post = require('../models/posts');

const defaultImage = {
    fieldname: "imageFile",
    originalname: "default.jpg",
    mimetype: "image/jpg",
    destination: "/public/images",
    Path: "/public/images/default.jpg",
    id: "1_0Mmyv91lKDI9MeENtezOQIMPszZYbcn",
    parentid: "1hZwfDidEke35yXro4ZWXzTeRT0ex7A18"
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
    let fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [defaultImage.parentid]
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
        defaultCover.parentid = file.data.id;
        let json = JSON.stringify(parent);
        fs.writeFile(`public/images/${name}/parent.json`, json ,(err) => {
          if(err) throw err;
        });
        
        fileMetadata = {
          name: 'cover.jpg',
          mimeType: defaultImage.mimetype,
          parents: [parent.id]
        };

        drive.files.copy({
          resource: fileMetadata,
          fileId: defaultImage.id,
          fields: 'id'
        },(err, file) => {
          if (err) {
            throw err;
          }
          else{
            defaultCover.id = file.data.id;
            

            drive.files.update({
              fileId: defaultCover.id,
              addParents: defaultCover.parentid,
              removeParents: defaultImage.parentid,
              fields: 'id, parents'
            }, function (err, file) {
              if (err) {
                throw err;
              } else {
                json = JSON.stringify(defaultCover);
                fs.writeFile(`public/images/${name}/cover.json`, json ,(err) => {
                  if(err) throw err;
                });
              }
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
            parent.id = file.data.id;
            let json = JSON.stringify(parent);
            fs.writeFile(`public/images/${name}/posts/parent.json`, json, (err) => {
              if(err) throw err;
            });
          }
        });
      }
    });
      
    
    
}


module.exports.uploadImage = (imageData) => {
  
  let parent = {};
  let filePath = `${imageData.destination}/parent.json`;

  fs.readFile(filePath, 'utf8' , (err, data) => {
    if (err){
        throw err;
    } 
    else {
      parent = JSON.parse(data);
      console.log(parent.id);
      imageData.parentid = parent.id;

      let fileMetadata = {
        name: imageData.originalname,
        parents: [parent.id],
        writersCanShare: true
      };
      let media = {
        mimeType: imageData.mimeType,
        body: fs.createReadStream(imageData.path)
      };

      drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      },(err, file) => {
        if (err) {
          throw err;
        } 
        else {
          imageData.id  = file.data.id;
          imageData.parentid = parent.id;
          let json = JSON.stringify(imageData);
          let name = imageData.originalname.split(".")[0];
          fs.writeFile(`${imageData.destination}/${name}.json`, json, (err) => {
            if(err) throw err;
          });
        }
      })
    }
  });
}

module.exports.updateImage = (imageData) => {
  
  let name = imageData.originalname.split(".")[0];
  let filePath = `${imageData.destination}/${name}.json`;

  if(fs.existsSync(filePath)){
    fs.readFile(filePath, 'utf8' , (err, data) => {
      if (err){
          throw err;
      } 
      else {
        oldImageData = JSON.parse(data);

        drive.files.delete({
          fileId: oldImageData.id
        },(err) => {
          if (err) {
            throw err;
          } 
          else {

            let fileMetadata = {
              name: imageData.originalname,
              parents: [oldImageData.parentid]
            };
            let media = {
              mimeType: imageData.mimeType,
              body: fs.createReadStream(imageData.Path)
            };

            drive.files.create({
              resource: fileMetadata,
              media: media,
              fields: 'id'
            },(err, file) => {
              if (err) {
                throw err;
              } 
              else {
                imageData.id  = file.data.id;
                imageData.parentid = oldImageData.parentid;

                let json = JSON.stringify(imageData);
                fs.writeFile(filePath, json, (err) => {
                  if(err) throw err;
                });

              }
            })
          }
        }); 
      }
    });
  }
  else{
    this.uploadImage(imageData);
  }
}
module.exports.getImage = (imageDest,imageName,res) => {
  
  let fileName = imageName.split(".")[0];
  let filePath = `public/${imageDest}/${fileName}.json`;
  let imagePath = `public/${imageDest}/${imageName}`;

  fs.readFile(filePath, 'utf8' , (err, data,file) => {
    if (err){
        throw err;
    } 
    else {
      imageData = JSON.parse(data);
      
      let fileId = imageData.id;
      let dest = fs.createWriteStream(imagePath);
      
      drive.files.get({
        fileId: fileId,
        alt: 'media'
      },{responseType: 'stream'},(err, res) =>{
        res.data
        .on('end', () => {
          console.log('Done');
        })
        .on('error', err => {
          console.log('Error', err);
        })
        .pipe(dest);
      });
    }
  });
}

module.exports.deleteImage = (postId,userId) => {
  
  let filePath = `/public/images/${userId}/posts/${postId}.json`;

  fs.readFile(filePath, 'utf8' , (err, data) => {
    if (err){
        throw err;
    } 
    else {
      ImageData = JSON.parse(data);
        
      drive.files.delete({
        fileId: ImageData.id
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



