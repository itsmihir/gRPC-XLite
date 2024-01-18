// Common setup also present in server/index.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// load the proto file
const packageDefinition = protoLoader.loadSync('client/client.proto');

// Think of this as compiling the proto file
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const {Wall, Profile} = protoDescriptor.Twitter;

// Common setup ends

const stub = new Wall('localhost:40000', grpc.credentials.createInsecure());

const command = process.argv[2];

if(command === 'save') {
    stub.SaveTweet({
        id: '-1',
        text: process.argv[3],
        author: process.argv[4]
    },function(err, response) {
        if(err) {
            console.log(err);
        } else {
            console.log(response);
        }
    })
}

if(command === 'get') {
    // use null or empty to sent data to the server 
    stub.getTweets(null, function(err, response) {
        console.log(response);
    });
}

if(command === 'getStream') {
    const call = stub.getTweetsStream(null);
    call.on('data', function(data) {
        console.log('Received data:');
        console.log(data);
    });
    call.on('end', function() {
        console.log('stream ended');
    })
}

// we need to create a new stub for the Profile service
const ProfileStub = new Profile('localhost:40000', grpc.credentials.createInsecure());

if(command === 'uploadPhoto') {
    const file = process.argv[3];
    const call = ProfileStub.ChangeProfilePicture(function(err) {
        if(err) {
            console.log(err);
        }
    })
    // convert the file into a stream
    const fs = require('fs');
    const stream = fs.createReadStream(file);

    stream.on('data', function(chunk) {
        console.log("sending chunk to server ...");
        call.write({
            // note that we have photo_data in the proto file but here we use photoData
            // this is because the proto file is converted to camelCase
            photoData: chunk
        });    
    });

    stream.on('end', function() {
        console.log("No more data to send")
        call.end();
    })
}