const { S3Client } = require("@aws-sdk/client-s3");

const {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} = process.env;

// The name of the bucket that you have created
const AWS_BUCKET_NAME = 'media-trivia-images';
const REGION = "eu-west-1";

// Create an Amazon S3 service client object.
const s3Client = new S3Client({ region: REGION, credentials:{
    accessKeyId:AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
} });

module.exports = {s3Client, REGION, AWS_BUCKET_NAME}
