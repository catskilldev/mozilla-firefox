/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// The `*testPaths` defined below for test paths are the main path formats we
// prefer to support for tests as they are commonly used across the tree.

// We prefer the tests to be in named directories as this makes it easier
// to identify the types of tests developers are working with. Additionally,
// it is not possible to scope ESLint rules to individual files based on .ini
// files without a build step that would break editors, or an expensive loading
// cycle.

// Please do not add more cases of multiple test types in a single
// directory. This may cause ESLint rules to be incorrectly applied to the wrong
// tests, leading to false negatives. It could cause the wrong sets of globals
// to be defined in the scope, causing false positives when checking for no
// undefined variables.

// See https://firefox-source-docs.mozilla.org/code-quality/lint/linters/eslint.html#i-m-adding-tests-how-do-i-set-up-the-right-configuration
// for more information.

const browserTestPaths = ["**/test*/**/browser*/"];

const chromeTestPaths = ["**/test*/chrome/"];

const mochitestTestPaths = [
  // Note: we do not want to match testing/mochitest as that would apply
  // too many globals for that directory.
  "**/test/mochitest*/",
  "**/tests/mochitest*/",
  "testing/mochitest/tests/SimpleTest/",
  "testing/mochitest/tests/Harness_sanity/",
];

const xpcshellTestPaths = [
  "**/test*/unit*/**/",
  "**/test*/*/unit*/",
  "**/test*/xpcshell/**/",
];

// NOTE: Before adding to the list below, please see the note at the top
// of the file.

const extraXpcshellTestPaths = [
  "devtools/platform/tests/xpcshell/",
  "dom/file/tests/",
  "dom/ipc/tests/",
  "intl/benchmarks/",
  "intl/l10n/test/",
  "ipc/testshell/tests/",
  "memory/replace/dmd/test/",
  "netwerk/test/httpserver/test/",
  "testing/modules/tests/xpcshell/",
  "toolkit/components/backgroundhangmonitor/tests/",
  "toolkit/components/downloads/test/data/",
  "toolkit/components/mozintl/test/",
  "toolkit/components/places/tests/",
  "toolkit/components/places/tests/bookmarks/",
  "toolkit/components/places/tests/expiration/",
  "toolkit/components/places/tests/favicons/",
  "toolkit/components/places/tests/history/",
  "toolkit/components/places/tests/legacy/",
  "toolkit/components/places/tests/migration/",
  "toolkit/components/places/tests/queries/",
  "toolkit/components/thumbnails/test/",
  "toolkit/modules/tests/modules/",
  "toolkit/mozapps/update/tests/data/",
  "toolkit/profile/xpcshell/",
  "toolkit/xre/test/",
  "widget/headless/tests/",
];

// NOTE: Before adding to the list below, please see the note at the top
// of the file.

const extraBrowserTestPaths = [
  "dom/ipc/tests/",
  "toolkit/components/thumbnails/test/",
  "toolkit/xre/test/",
  "browser/base/content/test/about/",
  "browser/base/content/test/alerts/",
  "browser/base/content/test/backforward/",
  "browser/base/content/test/caps/",
  "browser/base/content/test/captivePortal/",
  "browser/base/content/test/contentTheme/",
  "browser/base/content/test/contextMenu/",
  "browser/base/content/test/favicons/",
  "browser/base/content/test/forms/",
  "browser/base/content/test/fullscreen/",
  "browser/base/content/test/general/",
  "browser/base/content/test/gesture/",
  "browser/base/content/test/historySwipeAnimation/",
  "browser/base/content/test/keyboard/",
  "browser/base/content/test/menubar/",
  "browser/base/content/test/metaTags/",
  "browser/base/content/test/notificationbox/",
  "browser/base/content/test/outOfProcess/",
  "browser/base/content/test/pageActions/",
  "browser/base/content/test/pageStyle/",
  "browser/base/content/test/pageinfo/",
  "browser/base/content/test/performance/",
  "browser/base/content/test/permissions/",
  "browser/base/content/test/plugins/",
  "browser/base/content/test/popupNotifications/",
  "browser/base/content/test/popups/",
  "browser/base/content/test/privateBrowsing/",
  "browser/base/content/test/protectionsUI/",
  "browser/base/content/test/referrer/",
  "browser/base/content/test/sanitize/",
  "browser/base/content/test/sidebar/",
  "browser/base/content/test/siteIdentity/",
  "browser/base/content/test/startup/",
  "browser/base/content/test/static/",
  "browser/base/content/test/sync/",
  "browser/base/content/test/tabMediaIndicator/",
  "browser/base/content/test/tabPrompts/",
  "browser/base/content/test/tabcrashed/",
  "browser/base/content/test/tabdialogs/",
  "browser/base/content/test/touch/",
  "browser/base/content/test/utilityOverlay/",
  "browser/base/content/test/webextensions/",
  "browser/base/content/test/webrtc/",
  "browser/base/content/test/zoom/",
  "browser/components/customizableui/test/",
  "browser/components/pocket/test/",
  "browser/components/preferences/tests/",
  "browser/components/safebrowsing/content/test/",
  "browser/components/sessionstore/test/",
  "browser/components/shell/test/",
  "browser/components/touchbar/tests/",
  "browser/components/uitour/test/",
  "browser/extensions/report-site-issue/test/browser/",
  "browser/tools/mozscreenshots/",
  "caps/tests/mochitest/",
  "devtools/client/debugger/test/mochitest/",
  "devtools/client/dom/test/",
  "devtools/client/framework/browser-toolbox/test/",
  "devtools/client/framework/test/",
  "devtools/client/inspector/animation/test/",
  "devtools/client/inspector/boxmodel/test/",
  "devtools/client/inspector/changes/test/",
  "devtools/client/inspector/computed/test/",
  "devtools/client/inspector/extensions/test/",
  "devtools/client/inspector/flexbox/test/",
  "devtools/client/inspector/fonts/test/",
  "devtools/client/inspector/grids/test/",
  "devtools/client/inspector/markup/test/",
  "devtools/client/inspector/rules/test/",
  "devtools/client/inspector/shared/test/",
  "devtools/client/inspector/test/",
  "devtools/client/jsonview/test/",
  "devtools/client/memory/test/browser/",
  "devtools/client/netmonitor/src/har/test/",
  "devtools/client/netmonitor/test/",
  "devtools/client/shared/sourceeditor/test/",
  "devtools/client/shared/test/",
  "devtools/client/storage/test/",
  "devtools/client/styleeditor/test/",
  "devtools/shared/commands/inspected-window/tests/",
  "devtools/shared/commands/inspector/tests/",
  "devtools/shared/commands/network/tests/",
  "devtools/shared/commands/resource/tests/",
  "devtools/shared/commands/script/tests/",
  "devtools/shared/commands/target-configuration/tests/",
  "devtools/shared/commands/target/tests/",
  "devtools/shared/commands/thread-configuration/tests/",
  "devtools/shared/test-helpers/",
  "docshell/test/navigation/",
  "dom/base/test/",
  "dom/broadcastchannel/tests/",
  "dom/events/test/",
  "dom/fetch/tests/",
  "dom/file/ipc/tests/",
  "dom/html/test/",
  "dom/indexedDB/test/",
  "dom/ipc/tests/",
  "dom/l10n/tests/mochitest/",
  "dom/localstorage/test/",
  "dom/manifest/test/",
  "dom/midi/tests/",
  "dom/payments/test/",
  "dom/plugins/test/mochitest/",
  "dom/reporting/tests/",
  "dom/security/test/cors/",
  "dom/security/test/csp/",
  "dom/security/test/general/",
  "dom/security/test/https-first/",
  "dom/security/test/https-only/",
  "dom/security/test/mixedcontentblocker/",
  "dom/security/test/referrer-policy/",
  "dom/security/test/sec-fetch/",
  "dom/serviceworkers/test/",
  "dom/tests/browser/",
  "dom/url/tests/",
  "dom/workers/test/",
  "dom/xhr/tests/",
  "editor/libeditor/tests/",
  "extensions/permissions/test/",
  "layout/base/tests/",
  "layout/style/test/",
  "layout/xul/test/",
  "netwerk/test/useragent/",
  "parser/htmlparser/tests/mochitest/",
  "security/sandbox/test/",
  "testing/mochitest/baselinecoverage/browser_chrome/",
  "testing/mochitest/tests/python/files/",
  "toolkit/components/alerts/test/",
  "toolkit/components/mozprotocol/tests/",
  "toolkit/components/narrate/test/",
  "toolkit/components/pdfjs/test/",
  "toolkit/components/pictureinpicture/tests/",
  "toolkit/components/printing/tests/",
  "toolkit/components/reader/tests/",
  "toolkit/components/thumbnails/test/",
  "toolkit/components/tooltiptext/tests/",
  "toolkit/components/windowcreator/test/",
  "toolkit/components/windowwatcher/test/",
  "toolkit/mozapps/extensions/test/xpinstall/",
  "uriloader/exthandler/tests/mochitest/",
];

// NOTE: Before adding to the list below, please see the note at the top
// of the file.

const extraChromeTestPaths = [
  "devtools/shared/security/tests/chrome/",
  "devtools/shared/webconsole/test/chrome/",
  "dom/base/test/",
  "dom/battery/test/",
  "dom/bindings/test/",
  "dom/console/tests/",
  "dom/encoding/test/",
  "dom/events/test/",
  "dom/flex/test/",
  "dom/grid/test/",
  "dom/html/test/",
  "dom/html/test/forms/",
  "dom/indexedDB/test/",
  "dom/messagechannel/tests/",
  "dom/network/tests/",
  "dom/promise/tests/",
  "dom/security/test/general/",
  "dom/security/test/sec-fetch/",
  "dom/serviceworkers/test/",
  "dom/system/tests/",
  "dom/url/tests/",
  "dom/websocket/tests/",
  "dom/workers/test/",
  "dom/xul/test/",
  "editor/composer/test/",
  "extensions/universalchardet/tests/",
  "gfx/layers/apz/test/mochitest/",
  "image/test/mochitest/",
  "layout/forms/test/",
  "layout/generic/test/",
  "layout/mathml/tests/",
  "layout/svg/tests/",
  "layout/xul/test/",
  "toolkit/components/aboutmemory/tests/",
  "toolkit/components/printing/tests/",
  "toolkit/components/url-classifier/tests/mochitest/",
  "toolkit/components/viewsource/test/",
  "toolkit/components/windowcreator/test/",
  "toolkit/components/windowwatcher/test/",
  "toolkit/components/workerloader/tests/",
  "toolkit/content/tests/widgets/",
  "toolkit/profile/test/",
  "widget/tests/",
  "xpfe/appshell/test/",
];

// NOTE: Before adding to the list below, please see the note at the top
// of the file.

const extraMochitestTestPaths = [
  "dom/ipc/tests/",
  "toolkit/xre/test/",
  "accessible/tests/crashtests/",
  "browser/components/protocolhandler/test/",
  "caps/tests/mochitest/",
  "docshell/test/iframesandbox/",
  "docshell/test/navigation/",
  "dom/abort/tests/",
  "dom/animation/test/mozilla/",
  "dom/animation/test/style/",
  "dom/base/test/",
  "dom/battery/test/",
  "dom/bindings/test/",
  "dom/broadcastchannel/tests/",
  "dom/canvas/test/",
  "dom/console/tests/",
  "dom/credentialmanagement/tests/",
  "dom/crypto/test/",
  "dom/encoding/test/",
  "dom/events/test/",
  "dom/file/tests/",
  "dom/file/ipc/tests/",
  "dom/filesystem/compat/tests/",
  "dom/filesystem/tests/",
  "dom/html/test/",
  "dom/html/test/forms/",
  "dom/indexedDB/test/",
  "dom/ipc/tests/",
  "dom/jsurl/test/",
  "dom/localstorage/test/",
  "dom/locks/test/",
  "dom/manifest/test/",
  "dom/media/mediasession/test/",
  "dom/media/mediasource/test/",
  "dom/media/test/",
  "dom/media/webaudio/test/",
  "dom/media/webcodecs/test/",
  "dom/media/webspeech/recognition/test/",
  "dom/media/webspeech/synth/test/",
  "dom/messagechannel/tests/",
  "dom/midi/tests/",
  "dom/network/tests/",
  "dom/payments/test/",
  "dom/performance/tests/",
  "dom/permission/tests/",
  "dom/plugins/test/mochitest/",
  "dom/promise/tests/",
  "dom/push/test/",
  "dom/quota/test/modules/content/",
  "dom/reporting/tests/",
  "dom/security/test/cors/",
  "dom/security/test/csp/",
  "dom/security/test/https-only/",
  "dom/security/test/mixedcontentblocker/",
  "dom/security/test/referrer-policy/",
  "dom/security/test/sec-fetch/",
  "dom/security/test/sri/",
  "dom/serviceworkers/test/",
  "dom/smil/test/",
  "dom/svg/test/",
  "dom/system/tests/",
  "dom/u2f/tests/",
  "dom/url/tests/",
  "dom/webauthn/tests/",
  "dom/websocket/tests/",
  "dom/workers/test/",
  "dom/worklet/tests/",
  "dom/xhr/tests/",
  "dom/xml/test/",
  "dom/xul/test/",
  "editor/composer/test/",
  "editor/libeditor/tests/",
  "editor/spellchecker/tests/",
  "extensions/permissions/test/",
  "gfx/layers/apz/test/mochitest/",
  "image/test/mochitest/",
  "intl/uconv/tests/",
  "layout/base/tests/",
  "layout/forms/test/",
  "layout/generic/test/",
  "layout/inspector/tests/",
  "layout/style/test/",
  "layout/svg/tests/",
  "layout/tables/test/",
  "layout/xul/test/",
  "parser/htmlparser/tests/mochitest/",
  "services/sync/tests/tps/",
  "testing/mochitest/baselinecoverage/plain/",
  "testing/mochitest/tests/python/files/",
  "toolkit/components/alerts/test/",
  "toolkit/components/passwordmgr/test/mochitest/",
  "toolkit/components/prompts/test/",
  "toolkit/components/satchel/test/",
  "toolkit/components/url-classifier/tests/mochitest/",
  "toolkit/components/windowcreator/test/",
  "toolkit/components/windowwatcher/test/",
  "toolkit/content/tests/widgets/",
  "toolkit/xre/test/",
  "uriloader/exthandler/tests/mochitest/",
  "widget/tests/",
];

// Please DO NOT add more entries to the list below.
// Doing so may cause conflicts in ESLint rules and globals, and cause
// unexpected issues to be raised or missed.
let expectedDupePaths = new Set([
  "caps/tests/mochitest/",
  "docshell/test/navigation/",
  "dom/base/test/",
  "dom/battery/test/",
  "dom/bindings/test/",
  "dom/broadcastchannel/tests/",
  "dom/console/tests/",
  "dom/encoding/test/",
  "dom/events/test/",
  "dom/file/tests/",
  "dom/file/ipc/tests/",
  "dom/indexedDB/test/",
  "dom/ipc/tests/",
  "dom/localstorage/test/",
  "dom/html/test/",
  "dom/html/test/forms/",
  "dom/manifest/test/",
  "dom/messagechannel/tests/",
  "dom/midi/tests/",
  "dom/network/tests/",
  "dom/payments/test/",
  "dom/plugins/test/mochitest/",
  "dom/promise/tests/",
  "dom/reporting/tests/",
  "dom/security/test/cors/",
  "dom/security/test/csp/",
  "dom/security/test/general/",
  "dom/security/test/https-only/",
  "dom/security/test/mixedcontentblocker/",
  "dom/security/test/referrer-policy/",
  "dom/security/test/sec-fetch/",
  "dom/serviceworkers/test/",
  "dom/system/tests/",
  "dom/url/tests/",
  "dom/websocket/tests/",
  "dom/workers/test/",
  "dom/xhr/tests/",
  "dom/xul/test/",
  "editor/composer/test/",
  "editor/libeditor/tests/",
  "extensions/permissions/test/",
  "gfx/layers/apz/test/mochitest/",
  "image/test/mochitest/",
  "layout/base/tests/",
  "layout/forms/test/",
  "layout/generic/test/",
  "layout/style/test/",
  "layout/svg/tests/",
  "layout/xul/test/",
  "parser/htmlparser/tests/mochitest/",
  "testing/mochitest/tests/python/files/",
  "toolkit/components/alerts/test/",
  "toolkit/components/printing/tests/",
  "toolkit/components/thumbnails/test/",
  "toolkit/components/url-classifier/tests/mochitest/",
  "toolkit/components/windowcreator/test/",
  "toolkit/components/windowwatcher/test/",
  "toolkit/content/tests/widgets/",
  "toolkit/xre/test/",
  "uriloader/exthandler/tests/mochitest/",
  "widget/tests/",
]);
// Please DO NOT add more paths to the list above.

let paths = new Set(extraXpcshellTestPaths);
for (let path of [
  ...extraBrowserTestPaths,
  ...extraChromeTestPaths,
  ...extraMochitestTestPaths,
]) {
  if (paths.has(path) && !expectedDupePaths.has(path)) {
    throw new Error(`
Unexpected directory containing different test types: ${path}

Please do not add new paths containing different test types. Please use
separate directories.

Having different test types in the same directory may cause ESLint rules to be
incorrectly applied.
`);
  }
  paths.add(path);
}

module.exports = {
  testPaths: {
    browser: [...browserTestPaths, ...extraBrowserTestPaths],
    chrome: [...chromeTestPaths, ...extraChromeTestPaths],
    mochitest: [...mochitestTestPaths, ...extraMochitestTestPaths],
    xpcshell: [...xpcshellTestPaths, ...extraXpcshellTestPaths],
  },
};
