import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
import { isDev, port, r } from '../scripts/utils'

export async function getManifest() {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType

  // update this file to update this manifest.json
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 2,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    browser_action: {
      default_icon: './assets/icon-512.png',
      default_popup: './dist/popup/index.html',
    },
    options_ui: {
      page: './dist/options/index.html',
      open_in_tab: true,
      chrome_style: false,
    },
    background: {
      page: './dist/background/index.html',
      persistent: false,
    },
    icons: {
      16: './assets/icon-512.png',
      48: './assets/icon-512.png',
      128: './assets/icon-512.png',
    },
    permissions: [
      'tabs',
      'storage',
      'activeTab',
      'scripting',
      'http://*/',
      'https://*/',
    ],
    content_scripts: [{
      matches: ['http://*/*', 'https://*/*'],
      js: ['./dist/contentScripts/index.global.js'],
    }],
    web_accessible_resources: [
      'dist/contentScripts/style.css',
    ],
    commands: {
      'Open Note Prompt': {
        suggested_key: {
          default: 'Ctrl+Shift+U',
          mac: 'Command+Shift+U',
        },
        description: 'Open the note prompt (use "Activate the extension" in Chrome)',
      },
      'Indent New Text': {
        suggested_key: {
          default: 'Ctrl+Shift+O',
          mac: 'Command+Shift+O',
        },
        description: 'Indent textbox',
      },
      'Unindent New Text': {
        suggested_key: {
          default: 'Ctrl+Shift+I',
          mac: 'Command+Shift+I',
        },
        description: 'Unindent textbox',
      },
      'Submit Prompt': {
        suggested_key: {
          default: 'Ctrl+Shift+P',
          mac: 'Command+Shift+P',
        },
        description: 'Submit changes to file',
      },
      'Move Textbox Up': {
        description: 'Move textbox up',
      },
      'Move Textbox Down': {
        description: 'Move textbox down',
      },
      'Extra Information (does nothing)': {
        description: 'You may find it useful to use Tab & Shift-Tab to switch between the file picker and the textbox!',
      },
    },
  }

  if (isDev) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts
    manifest.permissions?.push('webNavigation')

    // this is required on dev for Vite script to load
    manifest.content_security_policy = `script-src \'self\' http://localhost:${port}; object-src \'self\'`
  }

  return manifest
}
