// --- Deals loading, sorting, rendering with links, images, and search ---

let deals = [];

function renderDeals(filterText = "") {
  const dealList = document.getElementById("dealList");

  // Filter deals by search text (case insensitive)
  const filteredDeals = deals.filter(d => {
    const combinedText = `${d.store} ${d.title} ${d.breakdown.join(" ")} ${d.notes.join(" ")}`.toLowerCase();
    return combinedText.includes(filterText.toLowerCase());
  });

  // Sort by date desc, then store asc
  filteredDeals.sort((a, b) => {
    if (a.date === b.date) {
      return a.store.localeCompare(b.store);
    }
    return b.date.localeCompare(a.date);
  });

  dealList.innerHTML = filteredDeals.map(d => `
    <li class="deal-item">
      <div class="deal-store" style="font-weight:bold; font-size:1.2em;">${d.store}</div>
      <div class="deal-title"><strong>${d.title}</strong></div>
      ${d.productLink ? `<a href="${d.productLink}" target="_blank" rel="noopener noreferrer">View Product</a>` : ""}
      ${d.image ? `<div><img src="${d.image}" alt="${d.title}" style="max-width:200px; margin: 5px 0;" onerror="this.style.display='none'"/></div>` : ""}
      <ul class="deal-breakdown">
        ${d.breakdown.map(line => `<li>${line.includes('$') ? line.replace(/(\$\d+(\.\d+)?)/g, '<strong>$1</strong>') : line}</li>`).join("")}
      </ul>
      <ul class="deal-notes">
        ${d.notes.map(n => `<li>${n}</li>`).join("")}
      </ul>
    </li>
  `).join("");
}

// Fetch deals.json
fetch("deals.json")
  .then(res => res.json())
  .then(data => {
    deals = data;
    renderDeals();
  })
  .catch(err => console.error("Error loading deals.json", err));

// Search input for deals
const dealSearchInput = document.getElementById("dealSearchInput");
if (dealSearchInput) {
  dealSearchInput.addEventListener("input", () => renderDeals(dealSearchInput.value));
}

// --- Referral links load with new tab ---

fetch("referrals.json")
  .then(res => res.json())
  .then(referrals => {
    const referralList = document.getElementById("referralList");
    referralList.innerHTML = referrals
      .map(r => `<li><a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.name}</a></li>`)
      .join("");
  })
  .catch(err => console.error("Error loading referrals.json", err));

// --- Comments with nickname, edit, delete, char limit ---

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

  // Add event listeners for edit and delete buttons
  document.querySelectorAll(".edit-comment").forEach(button => {
    button.onclick = (e) => {
      const commentDiv = e.target.closest(".comment");
      const id = commentDiv.dataset.id;
      const commentObj = comments.find(c => c.id === id);
      if (!commentObj) return;

      // Replace comment text with editable textarea
      const textSpan = commentDiv.querySelector(".comment-text");
      textSpan.innerHTML = `<textarea class="edit-textarea" maxlength="300">${sanitizeHTML(commentObj.text)}</textarea>
        <br/><button class="save-edit">Save</button> <button class="cancel-edit">Cancel</button>`;

      // Save button
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

      // Cancel button
      commentDiv.querySelector(".cancel-edit").onclick = () => {
        renderComments();
      };
    };
  });

  // Delete button
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
  const id = Date.now().toString(); // simple unique id
  comments.push({ id, name, text });
  saveComments();
  commentInput.value = "";
  nameInput.value = "";
  renderComments();
});

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

renderComments();
