const username = encodeURIComponent("");
const password = encodeURIComponent("");
const clusterUrl = "ebda3.eo8hm.mongodb.net";

const authMechanism = "DEFAULT";

module.exports = {
    'secretKey': '',
    'mongoUrl' : `mongodb+srv://${username}:${password}@${clusterUrl}/DataBase?retryWrites=true&w=majority`
}
