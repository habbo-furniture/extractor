import * as gcp from "@pulumi/gcp"

const furniDataTopic = new gcp.pubsub.Topic("furni-data-topic")
const furniDataDeadLetterTopic = new gcp.pubsub.Topic("furni-data-dead-letter-topic")

new gcp.pubsub.Subscription("furni-data-dead-letter-subscription", {
    topic: furniDataTopic.name,
    deadLetterPolicy: {
        deadLetterTopic: furniDataDeadLetterTopic.id,
        maxDeliveryAttempts: 15
    }
})

export { furniDataTopic }