const nodemailer = require('nodemailer');
const config = require('config');
const mailConfig = config.get('mail');;
const baseUrl = config.get('server.baseUrl');
// const mailgun = require('mailgun-js')({ apiKey: mailConfig.apiKey, domain: mailConfig.domain });
const emailContent = require('./email_content');

const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: 587,
    secure: false,
    auth: {
        user: mailConfig.user,
        pass: mailConfig.key
    }
});

const Mailer = {

    /**
     * Send welcome email
     * @param {string} email 
     * @param {string} userId 
     * @param {string} emailConfirmationHash 
     */
    welcome(email, userId, emailConfirmationHash) {
        transporter.sendMail({
            from: mailConfig.from,
            to: email,
            subject: 'Welcome to Storyboarders! Please confirm your email.',
            text: emailContent.welcome(userId, emailConfirmationHash)
        });

        this.adminEmail('new user: ' + email, 'new user: ' + email + ' ' + userId)
    },

    /**
     * Send confirmation email
     * @param {string} email 
     * @param {string} userId 
     * @param {string} emailConfirmationHash 
     */
    confirmation(email, userId, emailConfirmationHash) {
        transporter.sendMail({
            from: mailConfig.from,
            to: email,
            subject: 'Please confirm your email.',
            text: emailContent.confirmation(userId, emailConfirmationHash)
        });
    },

    /**
     * Send forgot password email
     * @param {string} email 
     * @param {string} userId 
     * @param {string} forgotPasswordHash 
     */
    forgotPassword(email, userId, forgotPasswordHash) {
        transporter.sendMail({
            from: mailConfig.from,
            to: email,
            subject: 'Instructions to reset your password...',
            text: emailContent.forgotPassword(userId, forgotPasswordHash)
        });
    },

    /**
     * Send email about new comment
     * @param {string} email 
     * @param {string} comment 
     * @param {string} storyboardId 
     */
    async comment(email, comment, storyboardId) {
        transporter.sendMail({
            from: mailConfig.from,
            to: email,
            subject: 'New comment on your storyboard',
            text: emailContent.comment(storyboardId)
        }); 

        this.adminEmail('new comment', 'new comment: ' + comment + ' on ' + baseUrl + 'storyboard/' + storyboardId + '-_')
    },

    /**
     * Send email about new storyboard
     * @param {string} storyboardId 
     * @param {string} title 
     * @param {string} email 
     */
    async newStoryboard(storyboardId, title, email) {
        transporter.sendMail({
            from: mailConfig.from,
            to: email,
            subject: 'Congrats! Your storyboard ' + title + ' is ready!',
            text: emailContent.newStoryboard(storyboardId)
        });
  
        this.adminEmail('new storyboard', 'new storyboard: ' + title + ' ' + baseUrl + 'storyboard/' + storyboardId)
    },

    /**
     * Send email to Admin account
     * @param {string} subject 
     * @param {string} message 
     */
    adminEmail(subject, message) {
        transporter.sendMail({
            from: mailConfig.from,
            to: mailConfig.adminEmail,
            subject: subject,
            text: message
        });
    },

    /**
     * Generate random hash
     */
    generateHash() {
        return (Math.floor(Date.now() / 10) + Math.floor(Math.random() * 100000000000000000)).toString(36).substring(0, 10);
    }
}

module.exports = Mailer;
