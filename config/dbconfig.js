const username = encodeURIComponent("HossamYahia");
const password = encodeURIComponent("NoNamegm@1hy200");
const clusterUrl = "ebda3.eo8hm.mongodb.net";

const authMechanism = "DEFAULT";

module.exports = {
    'secretKey': 'A5s7-8W9e-Qwe8-L89O',
    'mongoUrl' : `mongodb+srv://${username}:${password}@${clusterUrl}/DataBase?retryWrites=true&w=majority`
}