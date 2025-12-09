// Load deals from deals.json
fetch("deals.json")
  .then(res => res.json())
  .then(deals => {
    const dealList = document.getElementById("dealList");

    dealList.innerHTML = deals.map(d => `
      <li class="deal-item">
        <div class="deal-store">${d.store}</div>
        <div class="deal-title"><strong>${d.title}</strong></div>

        <ul class="deal-breakdown">
          ${d.breakdown.map(line => `<li>${line}</li>`).join("")}
        </ul>

        <ul class="deal-notes">
          ${d.notes.map(n => `<li>${n}</li>`).join("")}
        </ul>
      </li>
    `).join("");
  })
  .catch(err => console.error("Error loading deals.json", err));


const comments = JSON.parse(localStorage.getItem("comments") || "[]");
const commentSection = document.getElementById("commentSection");
const postBtn = document.getElementById("postComment");

function renderComments() {
  commentSection.innerHTML = comments
    .map((c, i) => `<div class="comment"><strong>User:</strong> ${c}</div>`)
    .join("");
}

postBtn.addEventListener("click", () => {
  const input = document.getElementById("commentInput");
  const text = input.value.trim();
  if (!text) return;
  comments.push(text);
  localStorage.setItem("comments", JSON.stringify(comments));
  input.value = "";
  renderComments();
});

renderComments();
