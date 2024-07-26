const { createClient } = supabase;
const supabase2 = createClient(
  "https://zzalsobevusrwlgyahaj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWxzb2JldnVzcndsZ3lhaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjUyNTksImV4cCI6MjAzNzUwMTI1OX0.H8hlotvviqMWAhUs8nMju1s81uMbffzPYwHC_G-LJoM",
);
let submit = document.getElementById("submit");
const ul = document.getElementById("dataList");
let currentGroup = "home";
const sidebar = document.querySelector(".sidebar");
const newGroup = document.getElementById("New");
const login = document.getElementById("LOGIN");
const familyBUTT = document.getElementById("FAMILY");
const familypage = document.getElementById("Family_Tracking");
let texting = true;
familyBUTT.addEventListener("click", async function () {
  currentGroup = "family";
});
function loop() {
  if (currentGroup === "family") {
    familypage.style.display = "block";
    texting = false;
  } else {
    familypage.style.display = "none";
    texting = true;
  }
  requestAnimationFrame(loop);
}
loop();
async function signInWithGithub() {
  const { data, error } = await supabase2.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: "https://judemakes.dev/family/src",
    },
  });
}
const user = null;
async function userStatus() {
  const user = supabase2.auth.getUser();
  return user;
}
login.addEventListener("click", async function () {
  signInWithGithub();
  if (logedInAs.data.user.email) {
    document.getElementById("logedin").innerHTML = logedInAsEmail;
    document.getElementById("LOGIN").style.display = "none";
  }
});

let logedInAs = await userStatus();
let logedInAsEmail = logedInAs.data.user.email;
if (await logedInAs.data.user.email) {
  document.getElementById("logedin").innerHTML = logedInAsEmail;
}
async function initGroups() {
  let groups = await fetchData();
  for (let i = 0; i < groups.length; i++) {
    let group = document.createElement("button");
    group.textContent = groups[i].group;
    group.className = "group";
    sidebar.appendChild(group);
  }
}

await initGroups();
function checkButtons() {
  const childElements = sidebar.children;
  const childElementsArray = Array.from(childElements);
  for (let i = 0; i < childElementsArray.length; i++) {
    if (childElementsArray[i].tagName === "BUTTON") {
      if (childElementsArray[i].className === "group") {
        childElementsArray[i].addEventListener("click", async function () {
          currentGroup = childElementsArray[i].textContent;
          await data_to_list();
        });
      }
    }
  }
}
checkButtons();
newGroup.addEventListener("click", async function () {
  alert("New Group");
  let groupName = prompt("Enter the group name");
  let group = document.createElement("button");
  group.textContent = groupName;
  group.className = "group";
  sidebar.appendChild(group);
  checkButtons();
});
function addListItem(text, user) {
  // Create a new LI element for the text
  const div = document.createElement("div");
  const textItem = document.createElement("li");
  textItem.textContent = text;

  // Create a new LI element for the user
  const userItem = document.createElement("li");
  userItem.textContent = user;
  div.className = "message";
  // Get the UL element
  userItem.className = "user";
  div.appendChild(userItem);
  div.appendChild(textItem);
  ul.appendChild(div);
}
async function data_to_list() {
  let data = await fetchData();
  ul.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    if (data[i].group.toLowerCase() === currentGroup.toLowerCase()) {
      addListItem(data[i].message, data[i].user);
    } else {
    }
  }
  setTimeout(data_to_list, 5000);
}
await data_to_list();
submit.addEventListener("click", async function (event) {
  if (texting === true && logedInAsEmail) {
    event.preventDefault(); // Prevent the default form submission behavior
    let message = document.getElementById("message").value;
    let user = logedInAsEmail;
    await insertMessage("messages", message, user);
    await data_to_list();
  } else {
    alert("You are not logged in");
    alert("Texting is disabled");
  }
});

async function insertMessage(group, m, u) {
  const { error } = await supabase2
    .from(group)
    .insert({ message: m, user: u, group: currentGroup });

  if (error) {
    // Handle error here
    console.error("Error inserting country:", error.message);
  } else {
    // Handle success if needed
  }
}

async function fetchData() {
  try {
    const { data, error } = await supabase2.from("messages").select();

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
