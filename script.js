let deals = [];
let referrals = [];

function sanitizeHTML(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

// Render a list of deals to a UL element
function renderDealList(dealArray, containerId, showFullDetails = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = dealArray.map(d => `
    <li class="deal-item">
      <div class="deal-wrapper">

        <div class="deal-left">
          <div class="deal-store" style="font-weight:bold; font-size:1.1em;">
            ${sanitizeHTML(d.store)}
          </div>

          <div class="deal-title">
            <strong>${sanitizeHTML(d.title)}</strong>
          </div>

          ${d.productLink
            ? `<a href="${d.productLink}" target="_blank" rel="noopener noreferrer">View Product</a>`
            : ""
          }

          <ul class="deal-breakdown">
            ${d.breakdown.map(line =>
              `<li>${line.includes('$')
                ? line.replace(/(\$\d+(\.\d+)?)/g, '<strong>$1</strong>')
                : sanitizeHTML(line)}</li>`
            ).join("")}
          </ul>

          ${showFullDetails
            ? `<ul class="deal-notes">
                 ${d.notes.map(n => `<li>${sanitizeHTML(n)}</li>`).join("")}
               </ul>`
            : ""
          }
        </div>

        <div class="deal-right">
          ${d.image
            ? `<img src="${d.image}" alt="${sanitizeHTML(d.title)}"
                 style="max-width:200px; height:auto; display:block;"
                 onerror="this.style.display='none'">`
            : ""
          }
        </div>

      </div>
    </li>
  `).join("");
}

// Sort deals within a category by dateAdded desc (newest first)
function sortByDateDesc(arr) {
  return arr.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
}

// Build the main page deals view
function buildMainPage() {
  // 1. New Money Makers (across all stores)
  const newMM = deals.filter(d => d.moneyMaker && d.status === 0);
  const sortedNewMM = sortByDateDesc(newMM);
  renderDealList(sortedNewMM, "newMoneyMakersList");

  // 2. Group deals by store for further rendering
  const stores = [...new Set(deals.map(d => d.store))].sort();

  const storeSections = document.getElementById("storeSections");
  storeSections.innerHTML = ""; // clear before rendering

  stores.forEach(store => {
    // Filter Previous MM (status 1), sorted by date desc
    const previousMM = sortByDateDesc(deals.filter(d => d.store === store && d.moneyMaker && d.status === 1));
    // Filter New Non-MM (status 0, moneyMaker false)
    const newNonMM = sortByDateDesc(deals.filter(d => d.store === store && !d.moneyMaker && d.status === 0));

    const storeSectionHTML = `
      <hr/>
      <h3><a href="${store.toLowerCase().replace(/\s+/g, '')}.html">${sanitizeHTML(store)} Deals Page</a></h3>

      ${previousMM.length > 0 ? `<h4>Previous Money Makers</h4><ul id="${store}PreviousMMList"></ul>` : ""}
      ${newNonMM.length > 0 ? `<h4>New Deals</h4><ul id="${store}NewNonMMList"></ul>` : ""}
    `;

    storeSections.insertAdjacentHTML("beforeend", storeSectionHTML);

    if (previousMM.length > 0) renderDealList(previousMM, `${store}PreviousMMList`);
    if (newNonMM.length > 0) renderDealList(newNonMM, `${store}NewNonMMList`);
  });
}

// Load referrals into #referralList
function loadReferrals() {
  fetch("referrals.json")
    .then(res => res.json())
    .then(data => {
      referrals = data;
      const referralList = document.getElementById("referralList");
      referralList.innerHTML = referrals
        .map(r => `<li><a href="${r.url}" target="_blank" rel="noopener noreferrer">${sanitizeHTML(r.name)}</a></li>`)
        .join("");
    })
    .catch(err => console.error("Error loading referrals.json", err));
}

// Load deals and initialize main page
function loadDealsAndInit() {
  fetch("deals.json")
    .then(res => res.json())
    .then(data => {
      deals = data;
      buildMainPage();
    })
    .catch(err => console.error("Error loading deals.json", err));
}

// Comments stuff from your previous code (same as before)
let comments = JSON.parse(localStorage.getItem("comments") || "[]");
const commentSection = document.getElementById("commentSection");
const postBtn = document.getElementById("postComment");
const commentInput = document.getElementById("commentInput");
const nameInput = document.getElementById("nameInput");

function saveComments() {
  localStorage.setItem("comments", JSON.stringify(comments));
}

function renderComments() {
  commentSection.innerHTML = comments.map(c => `
    <div class="comment" data-id="${c.id}">
      <strong>${sanitizeHTML(c.name || "Anonymous")}:</strong>
      <span class="comment-text">${sanitizeHTML(c.text)}</span>
      <button class="edit-comment">Edit</button>
      <button class="delete-comment">Delete</button>
    </div>
  `).join("");

  document.querySelectorAll(".edit-comment").forEach(button => {
    button.onclick = (e) => {
      const commentDiv = e.target.closest(".comment");
      const id = commentDiv.dataset.id;
      const commentObj = comments.find(c => c.id === id);
      if (!commentObj) return;

      const textSpan = commentDiv.querySelector(".comment-text");
      textSpan.innerHTML = `<textarea class="edit-textarea" maxlength="300">${sanitizeHTML(commentObj.text)}</textarea>
        <br/><button class="save-edit">Save</button> <button class="cancel-edit">Cancel</button>`;

      commentDiv.querySelector(".save-edit").onclick = () => {
        const newText = commentDiv.querySelector(".edit-textarea").value.trim();
        if (newText.length === 0 || newText.length > 300) {
          alert("Comment must be 1-300 characters");
          return;
        }
        commentObj.text = newText;
        saveComments();
        renderComments();
      };

      commentDiv.querySelector(".cancel-edit").onclick = () => {
        renderComments();
      };
    };
  });

  document.querySelectorAll(".delete-comment").forEach(button => {
    button.onclick = (e) => {
      const commentDiv = e.target.closest(".comment");
      const id = commentDiv.dataset.id;
      comments = comments.filter(c => c.id !== id);
      saveComments();
      renderComments();
    };
  });
}

postBtn.addEventListener("click", () => {
  const name = (nameInput.value || "Anonymous").trim();
  const text = commentInput.value.trim();
  if (text.length === 0 || text.length > 300) {
    alert("Comment must be 1-300 characters");
    return;
  }
  const id = Date.now().toString();
  comments.push({ id, name, text });
  saveComments();
  commentInput.value = "";
  nameInput.value = "";
  renderComments();
});

loadDealsAndInit();
loadReferrals();
renderComments();
