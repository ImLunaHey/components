import { initViews, initImport } from "./workflows/data.js";
import { initMedia } from "./workflows/media.js";
import { initSharing, initKeys, initBilling } from "./workflows/accounts.js";
import { initBoard, initComments } from "./workflows/collaboration.js";
import { initMonitoring } from "./workflows/monitoring.js";
export function initWorkflowComponents() {
  for (const [id, init] of [
    ["saved-views", initViews],
    ["media-library", initMedia],
    ["csv-import", initImport],
    ["resource-sharing", initSharing],
    ["api-keys", initKeys],
    ["kanban-board", initBoard],
    ["comment-threads", initComments],
    ["dashboard-controls", initMonitoring],
    ["billing-panels", initBilling],
  ])
    if (document.getElementById(id)) init();
}
