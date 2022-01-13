import * as gcp from "@pulumi/gcp"
import * as pulumi from "@pulumi/pulumi"
import { furniDataTopic } from "./pubsub"
import * as archiver from "archiver"
import * as fs from "fs"
import { location, region } from "../location"
import { appEngine } from "./app"

const functionsFolder = __dirname + "/../functions"
fs.rmSync(functionsFolder + "/node_modules", { recursive: true, force: true })
const archiveWs = fs.createWriteStream(__dirname + "/../functions.zip")
const archive = archiver("zip")
archive.pipe(archiveWs)
archive.directory(functionsFolder + "/", false)
archive.finalize()

const functionsBucket = new gcp.storage.Bucket("bucket", { location });
const functionsArchive = new gcp.storage.BucketObject("archive", {
    bucket: functionsBucket.name,
    source: new pulumi.asset.FileAsset(__dirname + "/../functions.zip"),
});

const pubsub = new gcp.pubsub.Topic("trigger-extractor")

new gcp.cloudfunctions.Function("extractor", {
    description: "Extracts furnidata and publish the result in pubsub",
    runtime: "nodejs16",
    availableMemoryMb: 128,
    eventTrigger: {
        eventType: "google.pubsub.topic.publish",
        resource: pubsub.id
    },
    sourceArchiveBucket: functionsBucket.name,
    sourceArchiveObject: functionsArchive.name,
    entryPoint: "extractor",
    region
})

new gcp.cloudscheduler.Job("trigger-extractor", {
    schedule: "0 */12 * * *",
    pubsubTarget: {
        topicName: pubsub.id,
        data: furniDataTopic.id.apply(s => btoa(s))
    },
    region,
    timeZone: "Europe/Berlin"
})