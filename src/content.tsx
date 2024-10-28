import React from 'react';
import ReactDOM from 'react-dom';
import Extension from './components/Extension';

interface SiteConfig {
  classListContainer: string;
  targetClosest: string;
  buttonTarget: string;
}

let site: string | null = null;
let siteConfig: SiteConfig | null = null;
let currentButton: HTMLElement | null = null;

const checkSiteAndNotify = () => {
  const url = window.location.href;

  if (url.includes("linkedin.com")) {
    site = "LinkedIn";
    siteConfig = {
      classListContainer: "ql-editor",
      targetClosest: ".comments-comment-texteditor",
      buttonTarget: "display-flex justify-space-between",
    };
  } else if (url.includes("x.com") || url.includes("twitter.com")) {
    site = "Twitter";
    siteConfig = {
      classListContainer: "public-DraftEditor-content",
      targetClosest: ".css-175oi2r.r-18u37iz.r-184en5c",
      buttonTarget: "css-175oi2r r-1awozwy r-1ro0kt6 r-18u37iz r-16y2uox r-1pi2tsx r-1ny4l3l",
    };
  } else if (url.includes("reddit.com")) {
    site = "Reddit";
    siteConfig = {
      classListContainer: "overflow-y-auto",
      targetClosest: ".block.px-md.xs\\:px-0.text-tone-1",
      buttonTarget: "",
    };
  } else if (url.includes("quora.com")) {
    site = "Quora";
    siteConfig = {
      classListContainer: "doc",
      targetClosest: ".q-flex.qu-bg--gray_light.qu-py--small",
      buttonTarget: "",
    };
  }

  if (site) {
    console.log(`Opened in ${site}`);
    document.dispatchEvent(new CustomEvent('siteChanged', { detail: site }));
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ openedIn: site });
    }
  } else {
    console.log("The extension is not opened in LinkedIn, Twitter, Reddit, or Quora.");
  }
};

const handleFocusIn = (event: FocusEvent) => {
  if (!siteConfig) return;
  const target = event.target as HTMLElement;
  if (target.classList.contains(siteConfig.classListContainer)) {
    const parentForm = target.closest(siteConfig.targetClosest);

    if (parentForm instanceof HTMLElement && !parentForm.classList.contains("buttons-appended")) {
      parentForm.classList.add("buttons-appended");
      insertButton(parentForm);
    }
  }
};

const insertButton = (parentForm: HTMLElement) => {
  if (!siteConfig) return;
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "SOCIALSCRIBE_BUTTONS";

  const button = document.createElement("button");
  button.className = "socialscribe-button";
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  button.addEventListener("click", (e: MouseEvent) => {
    e.stopPropagation();
    const rect = button.getBoundingClientRect();
    currentButton = button;
    document.dispatchEvent(new CustomEvent('toggleSocialScribePopup', { 
      detail: { x: rect.left, y: rect.top, button: button }
    }));
  });

  buttonContainer.appendChild(button);

  let targetDiv: HTMLElement | null = null;
  if (site === "Reddit") {
    targetDiv = findRedditTargetDiv(parentForm);
  } else if (site === "Quora") {
    targetDiv = parentForm;
  } else {
    const elements = parentForm.getElementsByClassName(siteConfig.buttonTarget);
    if (elements.length > 0 && elements[0] instanceof HTMLElement) {
      targetDiv = elements[0];
    }
  }

  if (targetDiv) {
    if (site === "Quora") {
      targetDiv.insertBefore(buttonContainer, targetDiv.querySelector(".q-text.qu-dynamicFontSize--regular"));
    } else {
      if (targetDiv.firstChild) {
        targetDiv.insertBefore(buttonContainer, targetDiv.firstChild);
      } else {
        targetDiv.appendChild(buttonContainer);
      }
    }
  }
};

const findRedditTargetDiv = (parentForm: HTMLElement): HTMLElement | null => {
  const k = parentForm.querySelector('[bundlename="comment_composer"]');
  if (k instanceof HTMLElement) {
    const m0 = k.getElementsByClassName("m-0")[0];
    if (m0 instanceof HTMLElement) {
      const shadowRoot = m0.children[0]?.shadowRoot;
      if (shadowRoot) {
        const border = shadowRoot.querySelector(
          ".border.border-solid.rounded-\\[1\\.25rem\\].bg-neutral-background.border-neutral-border.focus-within\\:border-neutral-border-medium"
        );
        if (border instanceof HTMLElement) {
          const flexCol = border.querySelector(
            '.flex.flex-col[slot="rteComposer"]'
          );
          if (flexCol instanceof HTMLElement) {
            const flexColShadowRoot = flexCol.shadowRoot;
            if (flexColShadowRoot) {
              const actionBar = flexColShadowRoot.querySelector(
                ".action-bar.order-3"
              );
              if (actionBar instanceof HTMLElement) {
                const actionBarShadowRoot = actionBar.shadowRoot;
                if (actionBarShadowRoot) {
                  const pxXs =
                    actionBarShadowRoot.querySelector(".px-xs.py-2xs");
                  if (pxXs instanceof HTMLElement) {
                    return pxXs.querySelector(
                      ".flex.toolbar.w-full.max-w-full"
                    ) as HTMLElement;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return null;
};

const injectExtension = () => {
  const extensionRoot = document.createElement('div');
  extensionRoot.id = 'linkedin-extension-root';
  document.body.appendChild(extensionRoot);

  const shadowRoot = extensionRoot.attachShadow({ mode: 'open' });
  const shadowContainer = document.createElement('div');
  shadowContainer.id = 'extension-container';
  shadowRoot.appendChild(shadowContainer);

  const style = document.createElement('style');
  style.textContent = `
    #extension-container {
      all: initial;
    }
    #extension-container * {
      all: unset;
      box-sizing: border-box;
    }
    .socialscribe-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
    }
    .socialscribe-button:hover {
      background-color: rgba(29, 161, 242, 0.1);
      border-radius: 50%;
    }
  `;
  shadowRoot.appendChild(style);

  ReactDOM.render(<Extension />, shadowContainer);
};

checkSiteAndNotify();
document.addEventListener('focusin', handleFocusIn);
injectExtension();