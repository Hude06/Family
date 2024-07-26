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
async function signOut() {
  const { error } = await supabase2.auth.signOut();
}
// Async function to check if a user is logged in
async function userStatus() {
  const {
    data: { user },
    error,
  } = await supabase2.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
  return user;
}

// Function to update UI based on login status
async function updateUIBasedOnLoginStatus() {
  const user = await userStatus();
  if (user) {
    document.getElementById("logedin").innerHTML = user.email;
    document.getElementById("LOGIN").innerHTML = "Log Out";
  } else {
    console.log("LOGING IN OUR");
    signOut();
    document.getElementById("logedin").innerHTML = "";
    document.getElementById("LOGIN").innerHTML = "Log In";
  }
}

// Event listener for login/logout button
login.addEventListener("click", async function () {
  const user = await userStatus();
  if (user) {
    // User is logged in, so log out
    await supabase2.auth.signOut();
    localStorage.clear();
    await updateUIBasedOnLoginStatus();
  } else {
    // User is not logged in, so log in
    await signInWithGithub();
  }
});

// Function to handle GitHub sign-in
async function signInWithGithub() {
  const { data, error } = await supabase2.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: "https://judemakes.dev/family/src",
    },
  });
  if (error) {
    console.error("Error signing in with GitHub:", error.message);
  }
}

// Function to initialize groups
async function initGroups() {
  let groups = await fetchData();
  for (let i = 0; i < groups.length; i++) {
    let group = document.createElement("button");
    group.textContent = groups[i].group;
    group.className = "group";
    sidebar.appendChild(group);
  }
}

// Check buttons in the sidebar
function checkButtons() {
  const childElements = sidebar.children;
  const childElementsArray = Array.from(childElements);
  for (let i = 0; i < childElementsArray.length; i++) {
    if (
      childElementsArray[i].tagName === "BUTTON" &&
      childElementsArray[i].className === "group"
    ) {
      childElementsArray[i].addEventListener("click", async function () {
        console.log("Button clicked", childElementsArray[i].textContent);
        currentGroup = childElementsArray[i].textContent;
        await data_to_list();
      });
    }
  }
}

// Event listener for new group button
newGroup.addEventListener("click", async function () {
  alert("New Group");
  let groupName = prompt("Enter the group name");
  if (groupName) {
    let group = document.createElement("button");
    group.textContent = groupName;
    group.className = "group";
    sidebar.appendChild(group);
    checkButtons();
  }
});

// Function to add list items to the DOM
function addListItem(text, user) {
  const div = document.createElement("div");
  const textItem = document.createElement("li");
  textItem.textContent = text;

  const userItem = document.createElement("li");
  userItem.textContent = user;
  div.className = "message";
  userItem.className = "user";
  div.appendChild(userItem);
  div.appendChild(textItem);
  ul.appendChild(div);
}

// Function to fetch data from Supabase
async function fetchData() {
  try {
    const { data, error } = await supabase2.from("messages").select();
    if (error) {
      console.error("Error fetching data:", error.message);
    }
    return data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

// Function to update the list of messages based on current group
async function data_to_list() {
  let data = await fetchData();
  ul.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    if (data[i].group.toLowerCase() === currentGroup.toLowerCase()) {
      addListItem(data[i].message, data[i].user);
    } else {
      console.log("Not in the group");
    }
  }
  setTimeout(data_to_list, 5000);
}

// Event listener for submit button
submit.addEventListener("click", async function (event) {
  event.preventDefault(); // Prevent the default form submission behavior
  let message = document.getElementById("message").value;
  let user = (await userStatus()).email;
  await insertMessage("messages", message, user);
  await data_to_list();
});

// Function to insert a message into Supabase
async function insertMessage(group, m, u) {
  const { error } = await supabase2
    .from(group)
    .insert({ message: m, user: u, group: currentGroup });
  if (error) {
    console.error("Error inserting message:", error.message);
  }
}

// Initialize groups and update UI based on login status
await initGroups();
await updateUIBasedOnLoginStatus();
