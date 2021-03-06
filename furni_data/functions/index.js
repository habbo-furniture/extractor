const { PubSub } = require('@google-cloud/pubsub')
const fetch = require('node-fetch')
const process = require('process')

const availableHotels = ["com", "de", "nl", "com.tr", "com.br"]
const pubsub = new PubSub()
const topic = pubsub.topic(process.env["topic"])

/**
 * @param {object} message The Pub/Sub message.
 * @param {object} context The event metadata.
 */
exports.extractor = async (message, context) => {
    console.log(`Start extracting to ${topic.name}`)
    for (const hotel of availableHotels) {
        console.log(`Extracting ${hotel}`)
        const furniData = `https://www.habbo.${hotel}/gamedata/furnidata_json/1`
        const furnis = await fetch(furniData, { method: "get" }).then(data => data.json());
        await extractFurniture(furnis.wallitemtypes.furnitype, topic)
        await extractFurniture(furnis.roomitemtypes.furnitype, topic)
    }
}

async function extractFurniture(itemtype, topic) {
    for (const furni of itemtype) {
        console.log(`Publishing ${furni.classname}`)
        await topic.publishMessage({ json: furni })
    }
}
