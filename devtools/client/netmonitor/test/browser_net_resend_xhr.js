/* Any copyright is dedicated to the Public Domain.
 *  http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

/**
 * Tests if resending a request works.
 */

add_task(async function () {
  if (
    Services.prefs.getBoolPref(
      "devtools.netmonitor.features.newEditAndResend",
      true
    )
  ) {
    ok(
      true,
      "Skip this test when pref is true, because this panel won't be default when that is the case."
    );
    return;
  }
  const { tab, monitor } = await initNetMonitor(POST_RAW_URL, {
    requestCount: 1,
  });

  const { document, store, windowRequire } = monitor.panelWin;
  const Actions = windowRequire("devtools/client/netmonitor/src/actions/index");
  store.dispatch(Actions.batchEnable(false));

  // Executes 1 request
  await performRequests(monitor, tab, 1);

  // Selects 1st request
  const firstRequest = document.querySelectorAll(".request-list-item")[0];
  EventUtils.sendMouseEvent({ type: "mousedown" }, firstRequest);

  // Stores original request for comparison of values later
  const { getSelectedRequest } = windowRequire(
    "devtools/client/netmonitor/src/selectors/index"
  );
  const originalRequest = getSelectedRequest(store.getState());

  const waitForResentRequestEvent = waitForNetworkEvents(monitor, 1);
  // Context Menu > "Resend"
  EventUtils.sendMouseEvent({ type: "contextmenu" }, firstRequest);
  await selectContextMenuItem(monitor, "request-list-context-resend-only");
  await waitForResentRequestEvent;

  // Selects request that was resent
  const selectedRequest = getSelectedRequest(store.getState());

  // Compares if the requests are the same.
  Assert.strictEqual(
    originalRequest.url,
    selectedRequest.url,
    "Both requests are the same"
  );

  await teardown(monitor);
});
