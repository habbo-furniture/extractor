import * as gcp from "@pulumi/gcp"

const location = "EUROPE-WEST4"

const bucket = new gcp.storage.Bucket("furni-data", {
    location,
    versioning: { enabled: true },
    uniformBucketLevelAccess: true
})

export { bucket, location }