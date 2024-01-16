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