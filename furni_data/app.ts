import * as gcp from "@pulumi/gcp"

const appEngine = new gcp.appengine.Application("habbo-furniture", {
    project: "habbo-furniture",
    locationId: "eu-west",
});

export { appEngine }