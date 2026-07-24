
(function () {
  const BTN_CLASS = "anistream-open-btn";
  const BTN_BIG = "anistream-btn-big";
  const BTN_SMALL = "anistream-btn-small";
  const SITES = {
    //the two targets where we inject our buttons (a smaller one and a bigger one)
    anilist: {
      //this will put a button next to favorite and a bigger one to external streaming
      anchorSelector: ['div[class="actions"]', 'div[class="external-links-wrap"]']
    },
    mal: {

      anchorSelector: ['div [class="user-status-block js-user-status-block fn-grey6 clearfix al mt8 po-r"]', 'div [class="pb16 broadcasts"]'],
    },
  };

  let lastId = null;
  let syncToken = 0;

  function currentAnimeId() {
    return location.pathname.match(/\/anime\/(\d+)/)?.[1] ?? null;
  }

  function sourceForThisSite() {
    return location.hostname.includes("myanimelist") ? "mal" : "anilist";
  }


  function waitForAnchor(selector, timeout = 4000) {
    return new Promise((resolve) => {
      if (!selector) return resolve(null);
      const existing = document.querySelector(selector);
      if (existing) return resolve(existing);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }, timeout);
    });
  }
  function getOpenIcon() {
    const parser = new DOMParser();
    return parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link-icon lucide-external-link svg-inline--fa fa-w-16"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>', 'image/svg+xml');
  }
  function buildButton(id, source, size) {
    const btn = document.createElement("button");
    btn.classList.add(BTN_CLASS);
    btn.type = "button";
    if (size === 'big') {
      btn.id = BTN_BIG
      let icon = document.createElement("img");
      icon.id = "anistream-icon"
      icon.src = chrome.runtime.getURL("tv_banner.png")
      let text = document.createElement("span");
      text.id = "anistream-name"
      text.textContent = "AniStream"
      btn.prepend(icon);
      btn.append(text);
    }
    else {
      btn.id = BTN_SMALL
      btn.textContent = '';
      btn.appendChild(getOpenIcon().documentElement)
    }
    return buildEvent(btn, id, source, size);
  }
  function buildEvent(btn, id, source, size) {
    btn.addEventListener("click", () => {
      const text = document.getElementById("anistream-name")
      const parser = new DOMParser();
      let loading = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle-icon lucide-loader-circle spin svg-inline--fa fa-w-16"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>', 'image/svg+xml');
      let ok = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check svg-inline--fa fa-w-16"><path d="M20 6 9 17l-5-5"/></svg>', 'image/svg+xml');
      let declined = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x svg-inline--fa fa-w-16"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>', 'image/svg+xml');
      btn.disabled = true;

      if (size === 'big') {
        text.textContent = 'Opening...'
      }
      else {
        btn.textContent = ''
        btn.appendChild(loading.documentElement)
      }
      chrome.runtime.sendMessage({ type: "open-anime", source, id }, (res) => {
        btn.disabled = false;
        if (size === 'big') {
          text.textContent = res?.ok ? "Opened ✓" : "AniStream not running";
        }
        else {
          btn.textContent = ''
          res?.ok ? btn.appendChild(ok.documentElement) : btn.appendChild(declined.documentElement);
        }
        setTimeout(() => {
          if (btn.isConnected) {
            if (size === 'big')
              if (btn.className.match(/\binline\b/i)) text.textContent = "AniStream";
              else btn.textContent = "Open in AniStream";
            else {
              btn.textContent = '';
              btn.appendChild(getOpenIcon().documentElement)
            }
          };
        }, 2000);
      });
    });
    return btn;
  }

  async function sync() {
    const id = currentAnimeId();
    if (id === lastId) return;
    const token = ++syncToken;
    lastId = id;
    document.querySelectorAll(`.${BTN_CLASS}`)?.forEach(el => el.remove());
    if (id === null) return;

    const source = sourceForThisSite();
    const btnsmall = buildButton(id, source, 'small');
    const btnbig = buildButton(id, source, 'big');
    const anchorsmall = await waitForAnchor(SITES[source].anchorSelector[0]);
    const anchorbig = await waitForAnchor(SITES[source].anchorSelector[1]);
    if (token !== syncToken) return; // navigated away again while we waited

    if (anchorsmall && anchorbig) {
      btnsmall.classList.add(`${source}`, "small", "inline");
      btnbig.classList.add(`${source}`, 'big', "inline");
      anchorsmall.insertAdjacentElement("beforeend", btnsmall);
      anchorbig.insertAdjacentElement(source === 'mal' ? "afterbegin" : "beforeend", btnbig);
    } else {
      btnbig.textContent = "Open in AniStream"
      document.body.appendChild(btnbig); // floating fallback
    }
  }

  sync();
  setInterval(sync, 800);
})();