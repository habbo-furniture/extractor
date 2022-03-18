import * as gcp from "@pulumi/gcp"
import * as pulumi from "@pulumi/pulumi"
import { furniDataTopic } from "./pubsub"
import { location, region } from "../location"
import { appEngine } from "./app"

const functionsFolder = __dirname + "/functions/"

const functionsBucket = new gcp.storage.Bucket("bucket", { location });
const functionsArchive = new gcp.storage.BucketObject("archive", {
    bucket: functionsBucket.name,
    source: new pulumi.asset.FileArchive(functionsFolder),
});

const pubsub = new gcp.pubsub.Topic("trigger-extractor")

new gcp.cloudfunctions.Function("extractor", {
    description: "Extracts furnidata and publishes the result in pubsub",
    runtime: "nodejs16",
    availableMemoryMb: 128,
    environmentVariables: {
        topic: furniDataTopic.id 
    },
    eventTrigger: {
        eventType: "google.pubsub.topic.publish",
        resource: pubsub.id
    },
    sourceArchiveBucket: functionsBucket.name,
    sourceArchiveObject: functionsArchive.name,
    entryPoint: "extractor",
    region,
    maxInstances: 1,
    timeout: 540
})

new gcp.cloudscheduler.Job("trigger-extractor", {
    schedule: "0 */12 * * *",
    pubsubTarget: {
        topicName: pubsub.id,
        data: "0"
    },
    region,
    timeZone: "Europe/Berlin"
})
