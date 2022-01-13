import * as gcp from "@pulumi/gcp"
import { location } from "../location"

const bucket = new gcp.storage.Bucket("furni-data", {
    location,
    versioning: { enabled: true },
    uniformBucketLevelAccess: true
})

export { bucket }