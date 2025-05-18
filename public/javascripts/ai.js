function copyText() {
  const text = document.getElementById("resultText");
  text.select();
  document.execCommand("copy");
  alert("Copied to clipboard!");
}

function setTone(tone) {
  console.log("Selected tone:", tone);
  document.querySelector(".dropdown-content").style.display = "none";

  document.querySelector(".dropbtn").textContent = tone;
}

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.style.display === "block") {
        openDropdown.style.display = "none";
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".dropbtn").addEventListener("click", (e) => {
    e.preventDefault();
    const content = document.querySelector(".dropdown-content");
    content.style.display =
      content.style.display === "block" ? "none" : "block";
  });
});
