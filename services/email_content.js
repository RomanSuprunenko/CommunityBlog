const config = require('config');
const baseUrl = config.get('server.baseUrl');

const EmailContent = {

    /**
     * Returns welcome email body
     * @param {string} userId 
     * @param {string} hash 
     */
    welcome(userId, hash) {
        return `Hi there!

        Welcome to Storyboarders. We are really glad you're here!

        Please confirm your email by clicking on this link:

        ${baseUrl}/storyboarders/confirmation/${userId}/${hash}`
    },

    /**
     * Returns confirmation email body
     * @param {string} userId 
     * @param {string} hash 
     */
    confirmation(userId, hash) {
        return `Hi there!

        Please confirm your email by clicking on this link:

        ${baseUrl}/storyboarders/confirmation/${userId}/${hash}`
    },

    /**
     * Returns forgot password email body
     * @param {string} userId 
     * @param {string} hash 
     */
    forgotPassword(userId, hash) {
        return `Hi there! Sorry you forgot your password!

        Click this link to reset your password:

        ${baseUrl}/storyboarders/reset_password/${userId}/${hash}`
    },

    /**
     * Returns new comment email body
     * @param {string} storyboardId 
     */
    comment(storyboardId) {
        return `Hi!

        You got a new comment on:

        ${baseUrl}/storyboard/${storyboardId}`
    },

    /**
     * Returns new storyboard email body
     * @param {string} storyboardId 
     */
    newStoryboard(storyboardId) {
        return `Congrats!

        Your storyboard is ready for viewing and sharing.

        ${baseUrl}/storyboard/${storyboardId}`
    }
}

module.exports = EmailContent;