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
    console.log(`Start extracting to ${topic.name}`)
    availableHotels.forEach(async (hotel) => {
        console.log(`Extracting ${hotel}`)
        const furniData = `https://www.habbo.${hotel}/gamedata/furnidata_json/1`
        const furnis = await fetch(furniData, { method: "get" }).then(data => data.json());
        furnis.roomitemtypes.furnitype.forEach(async (furni) => {
            console.log(furni)
            await topic.publishMessage({ json: furni })
        })
    })
};