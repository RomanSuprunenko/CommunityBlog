const config = require('config');
const awsConfig = config.get('aws');
const AWS = require('aws-sdk');

AWS.config.update(awsConfig);

class S3 {
    constructor() {
        this._S3 = new AWS.S3();
    }

    /**
      * Use S3 'putObject' method
      * 
      * @param {string} bucketName - S3 bucket where file will be stored
      * @param {string} fileKey - S3 key for file to be stored
      * @param {Buffer} fileContent - raw data of file to be stored
      * @param {string} [contentType] - (optional) content type of image being stored
      * @returns {Promise<*>}
      */
    async uploadFile(bucketName, fileKey, fileContent, contentType) {
        return this._S3.upload({
            Bucket: bucketName,
            Key: fileKey,
            Body: fileContent,
            ContentType: contentType ? contentType : null,
            ACL: 'public-read',
            ContentEncoding: 'base64'
        })
            .promise()
            .catch((error) => {
                console.error(error);
                throw new Error(`Error uploading file to S3 bucket ${bucketName} with key ${fileKey} => ${error.message}`)
            });
    }


    /**
     * Use S3 'getObject' method
     * 
     * @param {string} bucketName - S3 bucket where file is stored
     * @param {string} fileKey - S3 key for file
     * @returns {Promise<*>}
     */
    async getFile(bucketName, fileKey) {
        return this._S3.getObject({
            Bucket: bucketName,
            Key: fileKey
        }).promise();
    }

    /**
    * List files from S3 bucket.
    *
    * @param bucketName
    * @param prefix
    */
    async listFiles(bucketName, prefix) {
        console.log('list files from S3')

        let params = {
            Bucket: bucketName,
            Prefix: prefix
        };

        try {
            let { Contents: files } = await this._S3.listObjects(params).promise();
            return files;
        }
        catch (err) {
            console.error(err);
            throw new Error(`Error listing files from S3 bucket ${bucketName} with prefix ${prefix} => ${err.message}`);
        }
    }

}

module.exports = S3;
