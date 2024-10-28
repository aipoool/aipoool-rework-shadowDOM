import React from 'react';
import ReactDOM from 'react-dom';
import Extension from './components/Extension';

interface SiteConfig {
  classListContainer: string;
  targetClosest: string;
  buttonTarget: string;
}

/************************************CHANGES HERE TO BE MADE/BOUGHT FROM THE PREV EXTENSION***********************/
/************Sites data fields here*********************/

interface TwitterPostData {
  username: string | null;
  text: string | null;
  imageUrl: string | null;
}

interface LinkedInPostData {
  username: string | null;
  text: string | null;
  imageUrls: string[];
}

interface RedditPostData {
  author: string | null;
  title: string | null;
  body: string | null;
  imageUrls: string[];
}

interface QuoraPostData {
  username: string | null;
  title: string | null;
  content: string | null;
  imageUrls: string[];
}
/************Sites data fields here*********************/

// let site: string | null = null;
// let siteConfig: SiteConfig | null = null;
// let currentButton: HTMLElement | null = null;

interface PostData {
  siteName: string;
  textData: string;
  imageURLs: string[];
}

class CommentBoxButton {
  private site: string = "";
  private siteConfig: SiteConfig = {
    classListContainer: "",
    targetClosest: "",
    buttonTarget: "",
  };
  public savedParentForm: HTMLElement | null = null;
  private currentButton: HTMLElement | null = null;
  private root: { unmount: () => void; } | null | undefined;

  constructor() {
    this.checkSiteAndNotify();
    this.init();
    this.injectExtension();

  }

  private init(): void {
    document.addEventListener("focusin", this.handleFocusIn);
  }

  private checkSiteAndNotify = () => {
    const url = window.location.href;
  
    if (url.includes("linkedin.com")) {
      this.site = "LinkedIn";
      this.siteConfig = {
        classListContainer: "ql-editor",
        targetClosest: ".comments-comment-texteditor",
        buttonTarget: "display-flex justify-space-between",
      };
    } else if (url.includes("x.com") || url.includes("twitter.com")) {
      this.site = "Twitter";
      this.siteConfig = {
        classListContainer: "public-DraftEditor-content",
        targetClosest: ".css-175oi2r.r-18u37iz.r-184en5c",
        buttonTarget: "css-175oi2r r-1awozwy r-1ro0kt6 r-18u37iz r-16y2uox r-1pi2tsx r-1ny4l3l",
      };
    } else if (url.includes("reddit.com")) {
      this.site = "Reddit";
      this.siteConfig = {
        classListContainer: "overflow-y-auto",
        targetClosest: ".block.px-md.xs\\:px-0.text-tone-1",
        buttonTarget: "",
      };
    } else if (url.includes("quora.com")) {
      this.site = "Quora";
      this.siteConfig = {
        classListContainer: "doc",
        targetClosest: ".q-flex.qu-bg--gray_light.qu-py--small",
        buttonTarget: "",
      };
    }
  
    if (this.site) {
      console.log(`Opened in ${this.site}`);
      document.dispatchEvent(new CustomEvent('siteChanged', { detail: this.site }));
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ openedIn: this.site });
      }
    } else {
      console.log("The extension is not opened in LinkedIn, Twitter, Reddit, or Quora.");
    }
  };
  
  private handleFocusIn = (event: FocusEvent) => {
    if (!this.siteConfig) return;
    const target = event.target as HTMLElement;
    if (target.classList.contains(this.siteConfig.classListContainer)) {
      const parentForm = target.closest(this.siteConfig.targetClosest);
  
      if (parentForm instanceof HTMLElement && !parentForm.classList.contains("buttons-appended")) {
        parentForm.classList.add("buttons-appended");
        this.insertButton(parentForm);
      }
    }
  };
  
  private insertButton = (parentForm: HTMLElement) => {
    if (!this.siteConfig) return;

    this.savedParentForm = parentForm; 
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
      this.currentButton = button;
      document.dispatchEvent(new CustomEvent('toggleSocialScribePopup', { 
        detail: { x: rect.left, y: rect.top, button: button }
      }));
    });
  
    buttonContainer.appendChild(button);
  
    let targetDiv: HTMLElement | null = null;
    if (this.site === "Reddit") {
      targetDiv = this.findRedditTargetDiv(parentForm);
    } else if (this.site === "Quora") {
      targetDiv = parentForm;
    } else {
      const elements = parentForm.getElementsByClassName(this.siteConfig.buttonTarget);
      if (elements.length > 0 && elements[0] instanceof HTMLElement) {
        targetDiv = elements[0];
      }
    }
  
    if (targetDiv) {
      if (this.site === "Quora") {
        targetDiv.insertBefore(buttonContainer, targetDiv.querySelector(".q-text.qu-dynamicFontSize--regular"));
      } else {
        if (targetDiv.firstChild) {
          targetDiv.insertBefore(buttonContainer, targetDiv.firstChild);
        } else {
          targetDiv.appendChild(buttonContainer);
        }
      }
    }

    this.fetchPostData(parentForm);
  };
  
  private findRedditTargetDiv = (parentForm: HTMLElement): HTMLElement | null => {
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
  
  private injectExtension = () => {
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

  /*** HELPER FUNCTIONS TO GET THE DATA *******************************/

  private getAllSpanText(container: Element | null): string {
    if (!container) return "";
    const spans = container.querySelectorAll("span");
    let allText: string[] = [];
    spans.forEach((span) => {
      const text = span.textContent?.trim();
      if (text) allText.push(text);
    });
    return allText.join(" ");
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
  }

  private extractTwitterPostData(
    parentElement: HTMLElement | null
  ): TwitterPostData {
    let username: string | null = null;
    let text: string | null = null;
    let imageUrl: string | null = null;

    if (!parentElement) {
      return { username, text, imageUrl };
    }

    try {
      // Find the username
      const userNameElement = parentElement.querySelector(
        '[data-testid="User-Name"]'
      );
      if (userNameElement) {
        const spanElements = userNameElement.querySelectorAll("span");
        if (spanElements.length > 0) {
          username = spanElements[0].textContent?.trim() || null;
        }
      }

      // Find the tweet text
      const tweetTextElement = parentElement.querySelector(
        '[data-testid="tweetText"]'
      );
      if (tweetTextElement) {
        text = tweetTextElement.textContent?.trim() || null;
      }

      // Find the tweet image
      const tweetPhotoElement1 = parentElement.querySelectorAll(
        '[data-testid="tweetPhoto"]'
      );
      const tweetPhotoElement2 = parentElement.querySelectorAll(
        'div[data-testid="card.wrapper"]'
      );

      if (tweetPhotoElement1.length > 0) {
        for (let i = 0; i < tweetPhotoElement1.length; i++) {
          const imgElement = tweetPhotoElement1[i].querySelector("img");
          if (imgElement instanceof HTMLImageElement) {
            imageUrl = imgElement.src || null;
            break;
          }
        }
      } else if (tweetPhotoElement2.length > 0) {
        for (let i = 0; i < tweetPhotoElement2.length; i++) {
          const imgElement = tweetPhotoElement2[i].querySelector("img");
          if (imgElement instanceof HTMLImageElement) {
            imageUrl = imgElement.src || null;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error extracting Twitter post data:", error);
    }

    return { username, text, imageUrl };
  }

  private extractLinkedInPostData(parentForm: HTMLElement): LinkedInPostData {
    let username: string | null = null;
    let text: string | null = null;
    let imageUrls: string[] = [];

    try {
      const parent = parentForm.closest(".feed-shared-update-v2");
      if (parent) {
        // Extract username
        const usernameElement = parent.querySelector(
          ".update-components-actor__container .update-components-actor__name"
        );
        if (usernameElement) {
          username = usernameElement.textContent?.trim() || null;
        }

        // Extract post text
        const elements = parent.getElementsByClassName(
          "feed-shared-update-v2__description-wrapper"
        );
        if (elements && elements.length > 0) {
          text = elements[0].textContent?.trim() || null;
        }

        // Extract image URLs
        const imageElements = parent.getElementsByClassName(
          "ivm-view-attr__img-wrapper"
        );
        if (imageElements) {
          for (let i = 1; i <= 4; i++) {
            const element = imageElements[i];
            if (element && element.childNodes && element.childNodes[5]) {
              const currentSrc = (element.childNodes[5] as HTMLImageElement)
                .currentSrc;
              if (currentSrc && currentSrc.includes("feedshare-shrink")) {
                imageUrls.push(currentSrc);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error extracting LinkedIn post data:", error);
    }

    return { username, text, imageUrls };
  }

  private extractRedditPostData(parentForm: HTMLElement): RedditPostData {
    let author: string | null = null;
    let title: string | null = null;
    let body: string | null = null;
    let imageUrls: string[] = [];

    // try {
    //   // Find the parent div with view-context="CommentsPage"
    //   const parent = parentForm.parentElement?.parentElement?.querySelector('[view-context="CommentsPage"]');

    //   if (parent) {
    //     // Extract author name
    //     author = parent.getAttribute('author') || null;

    //     // Extract post title
    //     const titleElement = parent.querySelector('[slot="title"]');
    //     if (titleElement) {
    //       title = titleElement.textContent?.trim() || null;
    //     }

    //     // Extract post body
    //     const bodyElement = parent.querySelector('[slot="text-body"] div[id$="-post-rtjson-content"]');
    //     if (bodyElement) {
    //       body = bodyElement.textContent?.trim() || null;
    //     }

    //     // Extract image URLs
    //     const postImgContainer = parent.querySelector('[slot="post-media-container"]');
    //     if (postImgContainer) {
    //       const imgElements = postImgContainer.querySelectorAll('img');
    //       imgElements.forEach(img => {
    //         if (img instanceof HTMLImageElement && img.src) {
    //           imageUrls.push(img.src);
    //         }
    //       });
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error extracting Reddit post data:', error);
    // }

    try {

        let parent = parentForm.parentElement?.parentElement?.querySelector('[view-context="CommentsPage"]');


      if (parent) {
        // Extract author name
        author = parent.getAttribute("author") || null;
      }

      if (parent instanceof HTMLElement) {
        localStorage.setItem(
          "redditClosest",
          ".block.xs\\:mt-xs.xs\\:-mx-xs.xs\\:px-xs.xs\\:rounded-\\[16px\\].pt-xs.nd\\:pt-xs.bg-\\[color\\:var$$--shreddit-content-background$$\\].box-border.mb-xs.nd\\:visible.nd\\:pb-2xl"
        );

        const titleElement = parent.querySelector('[slot="title"]');
        if (titleElement) {
          title = titleElement.textContent || "";
          console.log(`Post Title here : ${title}`);
        }

        const innerDiv =
          parent
            .querySelector('[slot="text-body"]')
            ?.querySelector("div.mb-sm.mb-xs.px-md.xs\\:px-0")
            ?.querySelector('div[id$="-post-rtjson-content"]') || null;

        if (innerDiv !== null) {
          const paragraphs = innerDiv.querySelectorAll("p");
          const paragraphTexts = Array.from(paragraphs).map(
            (paragraph) => paragraph.textContent || ""
          );
          body = paragraphTexts.join(" ");
        } else {
          body = "";
        }

        const textFiltered = title?.concat(body);

        const postImg = parent.querySelector('[slot="post-media-container"]');

        if (postImg) {
          const galleryCarousel = postImg.querySelector(
            '[bundlename="gallery_carousel"]'
          );
          if (galleryCarousel) {
            const mm = galleryCarousel.querySelector(
              ".nd\\:block.nd\\:overflow-hidden.nd\\:h-\\[var$$--gallery-initial-height$$\\]"
            );
            if (mm) {
              const unorderedList = mm.querySelector("ul");
              if (unorderedList) {
                const listItems = unorderedList.querySelectorAll("li");
                for (let i = 0; i < Math.min(3, listItems.length); i++) {
                  const li = listItems[i];
                  const img = li.querySelector("img");
                  if (img instanceof HTMLImageElement && img.src) {
                    imageUrls.push(img.src);
                  }
                }
              }
            }
          } else {
            const postImages = postImg.querySelectorAll('[id="post-image"]');
            for (let i = 0; i < Math.min(3, postImages.length); i++) {
              const img = postImages[i];
              if (img instanceof HTMLImageElement && img.currentSrc) {
                imageUrls.push(img.currentSrc);
              }
            }
          }
          console.log(imageUrls);
        }
      }
    } catch (error) {
      console.error("Error extracting Reddit post data:", error);
    }

    return { author, title, body, imageUrls };
  }

  private extractQuoraPostData(parentForm: HTMLElement): QuoraPostData {
    let username: string | null = null;
    let title: string | null = null;
    let content: string | null = null;
    let imageUrls: string[] = [];

    try {
      const contentDiv = parentForm.parentElement?.parentElement?.parentElement
        ?.parentElement?.parentElement?.parentElement
        ?.firstChild as HTMLElement | null;

      if (!contentDiv) {
        throw new Error("Content div not found");
      }

      const kk =
        contentDiv.querySelector(
          ".q-click-wrapper.qu-display--block.qu-tapHighlight--none"
        ) ||
        (parentForm.parentElement?.parentElement?.parentElement?.parentElement
          ?.parentElement?.parentElement?.parentElement?.parentElement
          ?.parentElement?.firstChild as HTMLElement | null);

      if (!kk) {
        throw new Error("Main div not found");
      }

      const nameEle =
        kk
          .querySelector(".q-flex")
          ?.querySelector(
            ".q-inlineFlex.qu-alignItems--center.qu-wordBreak--break-word"
          )
          ?.querySelector("span > span") ||
        kk
          .querySelector(".q-box")
          ?.querySelector(".q-box")
          ?.querySelector(
            ".q-inlineFlex.qu-alignItems--center.qu-wordBreak--break-word"
          )
          ?.querySelector("span > span");

      username = nameEle?.textContent?.trim() || null;

      const titleEle =
        kk
          .querySelector(".q-box.qu-mb--tiny")
          ?.querySelector(".q-box.qu-userSelect--text") ||
        kk
          .querySelector(".q-box.qu-mb--tiny")
          ?.querySelector(
            ".q-box.qu-cursor--pointer.qu-hover--textDecoration--underline"
          );

      title = this.getAllSpanText(titleEle || null);

      const contentEle =
        kk.querySelector(
          ".q-box.spacing_log_answer_content.puppeteer_test_answer_content"
        ) || kk.querySelector(".q-box");

      if (!contentEle) {
        throw new Error("Content element not found");
      }

      let concatenatedText = "";
      let targetElement = contentEle.querySelector(
        ".q-box.qu-userSelect--text"
      );

      if (!targetElement) {
        targetElement = contentEle.querySelector(
          ".q-text.qu-truncateLines--3.qu-wordBreak--break-word"
        );

        if (targetElement) {
          const spanEle = targetElement.querySelector("span.q-box");
          if (spanEle) {
            concatenatedText = spanEle.textContent ?? "";
          }
        }

        const contentEle2 = kk.querySelector(
          ".q-inlineBlock.qu-overflow--hidden"
        );

        if (contentEle2) {
          const boxDiv = contentEle2.querySelector(".q-box");
          if (boxDiv) {
            const styleAttr = boxDiv.getAttribute("style");
            const urlMatch = styleAttr?.match(/url\("([^"]+)"\)/);
            if (urlMatch && urlMatch[1]) {
              imageUrls.push(urlMatch[1]);
            }
          }
        }

        console.log("Concatenated Text:", concatenatedText);
        console.log("Image URLs:", imageUrls);
      } else {
        const simpleTxt = targetElement?.textContent;

        if (simpleTxt) {
          console.log("Entered the simple text section");

          concatenatedText += simpleTxt;

          const quorat1 = contentEle.querySelector(
            ".q-inlineBlock.qu-overflow--hidden"
          );

          const qBoxDiv = quorat1?.querySelector(
            '.q-box[style*="background-image"]'
          );

          if (qBoxDiv && qBoxDiv instanceof HTMLElement) {
            // Extract the style attribute
            const style = qBoxDiv.getAttribute("style");
            console.log(quorat1);
            console.log(style);

            if (style) {
              // Use a regular expression to find the URL in the background-image property
              const urlMatch = style?.match(/url$$"([^"]+)"$$/);
              console.log(urlMatch);

              if (urlMatch && urlMatch[1]) {
                console.log(urlMatch[1]);
                console.log(urlMatch);
                imageUrls.push(urlMatch[1]);
              }
            }
          }
        } else {
          const children = targetElement.children;
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.tagName.toLowerCase() === "p") {
              concatenatedText += child.textContent + " ";
            }
            if (child.tagName.toLowerCase() === "div") {
              const img = child.querySelector("img");
              if (img instanceof HTMLImageElement && imageUrls.length < 3) {
                imageUrls.push(img.src);
              }
            }
            if (child.tagName.toLowerCase() === "ul") {
              const listItems = child.querySelectorAll("li");
              if (listItems.length === 1) {
                const span = listItems[0].querySelector("span");
                if (span) {
                  concatenatedText += span.textContent + "\n";
                }
              }
            }
          }
        }
      }

      content = this.cleanText(concatenatedText);
    } catch (error) {
      console.error("Error extracting Quora post data:", error);
    }

    return { username, title, content, imageUrls };
  }

  /*** HELPER FUNCTIONS TO GET THE DATA *******************************/

  private fetchPostData(parentForm: HTMLElement): PostData {
    let textData = "";
    let imageURLs: string[] = [];

    if (this.site === "LinkedIn") {
      const postData = this.extractLinkedInPostData(parentForm);
      console.log("LinkedIn Post Data:", JSON.stringify(postData, null, 2));
    } else if (this.site === "Twitter") {
      const elements =
        parentForm.parentElement?.parentElement?.parentElement?.parentElement
          ?.parentElement?.parentElement?.parentElement?.parentElement
          ?.children[0];

      if (elements instanceof HTMLElement) {
        const postData = this.extractTwitterPostData(elements);
        console.log("Twitter Post Data:", postData);
      } else {
        console.log("Could not find the tweet container");
      }
    } else if (this.site === "Reddit") {
      const postData = this.extractRedditPostData(parentForm);
      console.log("Reddit Post Data:", JSON.stringify(postData, null, 2));

      console.log(imageURLs);
    } else if (this.site === "Quora") {
      const postData = this.extractQuoraPostData(parentForm);
      console.log("Quora Post Data:", JSON.stringify(postData, null, 2));
    }

    return {
      siteName: this.site,
      textData: textData.trim(),
      imageURLs: imageURLs,
    };
  }
}

// Initialize the CommentBoxButton
new CommentBoxButton();












/************************************CHANGES HERE TO BE MADE/BOUGHT FROM THE PREV EXTENSION***********************/

/** 
// let site: string | null = null;
// let siteConfig: SiteConfig | null = null;
// let currentButton: HTMLElement | null = null;

// const checkSiteAndNotify = () => {
//   const url = window.location.href;

//   if (url.includes("linkedin.com")) {
//     site = "LinkedIn";
//     siteConfig = {
//       classListContainer: "ql-editor",
//       targetClosest: ".comments-comment-texteditor",
//       buttonTarget: "display-flex justify-space-between",
//     };
//   } else if (url.includes("x.com") || url.includes("twitter.com")) {
//     site = "Twitter";
//     siteConfig = {
//       classListContainer: "public-DraftEditor-content",
//       targetClosest: ".css-175oi2r.r-18u37iz.r-184en5c",
//       buttonTarget: "css-175oi2r r-1awozwy r-1ro0kt6 r-18u37iz r-16y2uox r-1pi2tsx r-1ny4l3l",
//     };
//   } else if (url.includes("reddit.com")) {
//     site = "Reddit";
//     siteConfig = {
//       classListContainer: "overflow-y-auto",
//       targetClosest: ".block.px-md.xs\\:px-0.text-tone-1",
//       buttonTarget: "",
//     };
//   } else if (url.includes("quora.com")) {
//     site = "Quora";
//     siteConfig = {
//       classListContainer: "doc",
//       targetClosest: ".q-flex.qu-bg--gray_light.qu-py--small",
//       buttonTarget: "",
//     };
//   }

//   if (site) {
//     console.log(`Opened in ${site}`);
//     document.dispatchEvent(new CustomEvent('siteChanged', { detail: site }));
//     if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
//       chrome.runtime.sendMessage({ openedIn: site });
//     }
//   } else {
//     console.log("The extension is not opened in LinkedIn, Twitter, Reddit, or Quora.");
//   }
// };

// const handleFocusIn = (event: FocusEvent) => {
//   if (!siteConfig) return;
//   const target = event.target as HTMLElement;
//   if (target.classList.contains(siteConfig.classListContainer)) {
//     const parentForm = target.closest(siteConfig.targetClosest);

//     if (parentForm instanceof HTMLElement && !parentForm.classList.contains("buttons-appended")) {
//       parentForm.classList.add("buttons-appended");
//       insertButton(parentForm);
//     }
//   }
// };

// const insertButton = (parentForm: HTMLElement) => {
//   if (!siteConfig) return;
//   const buttonContainer = document.createElement("div");
//   buttonContainer.className = "SOCIALSCRIBE_BUTTONS";

//   const button = document.createElement("button");
//   button.className = "socialscribe-button";
//   button.innerHTML = `
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
//       <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
//       <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
//     </svg>
//   `;

//   button.addEventListener("click", (e: MouseEvent) => {
//     e.stopPropagation();
//     const rect = button.getBoundingClientRect();
//     currentButton = button;
//     document.dispatchEvent(new CustomEvent('toggleSocialScribePopup', { 
//       detail: { x: rect.left, y: rect.top, button: button }
//     }));
//   });

//   buttonContainer.appendChild(button);

//   let targetDiv: HTMLElement | null = null;
//   if (site === "Reddit") {
//     targetDiv = findRedditTargetDiv(parentForm);
//   } else if (site === "Quora") {
//     targetDiv = parentForm;
//   } else {
//     const elements = parentForm.getElementsByClassName(siteConfig.buttonTarget);
//     if (elements.length > 0 && elements[0] instanceof HTMLElement) {
//       targetDiv = elements[0];
//     }
//   }

//   if (targetDiv) {
//     if (site === "Quora") {
//       targetDiv.insertBefore(buttonContainer, targetDiv.querySelector(".q-text.qu-dynamicFontSize--regular"));
//     } else {
//       if (targetDiv.firstChild) {
//         targetDiv.insertBefore(buttonContainer, targetDiv.firstChild);
//       } else {
//         targetDiv.appendChild(buttonContainer);
//       }
//     }
//   }
// };

// const findRedditTargetDiv = (parentForm: HTMLElement): HTMLElement | null => {
//   const k = parentForm.querySelector('[bundlename="comment_composer"]');
//   if (k instanceof HTMLElement) {
//     const m0 = k.getElementsByClassName("m-0")[0];
//     if (m0 instanceof HTMLElement) {
//       const shadowRoot = m0.children[0]?.shadowRoot;
//       if (shadowRoot) {
//         const border = shadowRoot.querySelector(
//           ".border.border-solid.rounded-\\[1\\.25rem\\].bg-neutral-background.border-neutral-border.focus-within\\:border-neutral-border-medium"
//         );
//         if (border instanceof HTMLElement) {
//           const flexCol = border.querySelector(
//             '.flex.flex-col[slot="rteComposer"]'
//           );
//           if (flexCol instanceof HTMLElement) {
//             const flexColShadowRoot = flexCol.shadowRoot;
//             if (flexColShadowRoot) {
//               const actionBar = flexColShadowRoot.querySelector(
//                 ".action-bar.order-3"
//               );
//               if (actionBar instanceof HTMLElement) {
//                 const actionBarShadowRoot = actionBar.shadowRoot;
//                 if (actionBarShadowRoot) {
//                   const pxXs =
//                     actionBarShadowRoot.querySelector(".px-xs.py-2xs");
//                   if (pxXs instanceof HTMLElement) {
//                     return pxXs.querySelector(
//                       ".flex.toolbar.w-full.max-w-full"
//                     ) as HTMLElement;
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
//   return null;
// };

// const injectExtension = () => {
//   const extensionRoot = document.createElement('div');
//   extensionRoot.id = 'linkedin-extension-root';
//   document.body.appendChild(extensionRoot);

//   const shadowRoot = extensionRoot.attachShadow({ mode: 'open' });
//   const shadowContainer = document.createElement('div');
//   shadowContainer.id = 'extension-container';
//   shadowRoot.appendChild(shadowContainer);

//   const style = document.createElement('style');
//   style.textContent = `
//     #extension-container {
//       all: initial;
//     }
//     #extension-container * {
//       all: unset;
//       box-sizing: border-box;
//     }
//     .socialscribe-button {
//       background: none;
//       border: none;
//       cursor: pointer;
//       padding: 2px;
//     }
//     .socialscribe-button:hover {
//       background-color: rgba(29, 161, 242, 0.1);
//       border-radius: 50%;
//     }
//   `;
//   shadowRoot.appendChild(style);

//   ReactDOM.render(<Extension />, shadowContainer);
// };

// checkSiteAndNotify();
// document.addEventListener('focusin', handleFocusIn);
// injectExtension();

**/