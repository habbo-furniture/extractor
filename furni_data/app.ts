import * as gcp from "@pulumi/gcp"
import { region } from "../location";

const appEngine = new gcp.appengine.Application("habbo-furniture", {
    project: "habbo-furniture",
    locationId: region,
});

export { appEngine }