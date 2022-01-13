const { PubSub } = require('@google-cloud/pubsub')
const fetch = require('node-fetch')

const availableHotels = ["com", "de", "nl", "com.tr", "com.br"]

const pubsub = new PubSub()

/**
 * @param {object} message The Pub/Sub message.
 * @param {object} context The event metadata.
 */
exports.extractor = (message, context) => {
    const topic = pubsub.topic(Buffer.from(message.data, "base64"))
    availableHotels.forEach(async (hotel) => {
        const furniData = `https://www.habbo.${hotel}/gamedata/furnidata_json/1`
        const furnis = await fetch(furniData, { method: "get" }).then(data => data.json());
        furnis.roomitemtypes.furnitype.forEach(async (furni) => {
            await topic.publishMessage({ json: furni })
        })
    })
};