// Load deals from deals.json
fetch("deals.json")
  .then(res => res.json())
  .then(deals => {
    const dealList = document.getElementById("dealList");
    dealList.innerHTML = deals.map(d => `
      <li>
        <strong>${d.store}:</strong> ${d.title}
        — <a href="${d.link}" target="_blank">Link</a>
        <br><small>${d.notes}</small>
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
