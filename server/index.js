const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { text } = require('stream/consumers');

// load the proto file
const packageDefinition = protoLoader.loadSync('server/server.proto');

// Think of this as compiling the proto file
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const {Wall, Profile} = protoDescriptor.Twitter;

// create a server
const server = new grpc.Server();
server.addService(Wall.service, {
    SaveTweet,
    GetTweets,
    // server-side streaming
    GetTweetsStream
});

server.addService(Profile.service, {
    // clint-side streaming
    ChangeProfilePicture,
});

// http2 requires a secure connection, but grpc allows you to create an insecure connection
server.bindAsync('0.0.0.0:40000', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('Server running ...')
});

const tweets = [];

function SaveTweet(call, callback) {
    console.log("Saving tweet ...");
    tweets.push({
        id: tweets.length + 1,
        text: call.request.text,
        author: call.request.author
    })
    callback(null, tweets[tweets.length - 1])
}

function GetTweets(call, callback) {
    console.log("Getting tweets ...");
    // it has to be an object with a property called tweets
    callback(null, {tweets});

}

function GetTweetsStream(call, callback) {
    // call.write is used to send data to the client
    // we send one tweet at a time/network call
    console.log("Getting tweets stream ...");
    for(let i = 0; i < tweets.length; i++) {
        call.write(tweets[i]);
    }
    call.end(); 
}

function ChangeProfilePicture(call, callback) {
    console.log("Changing profile picture ...")
}
