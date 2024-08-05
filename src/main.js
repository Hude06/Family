// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(
  "https://zzalsobevusrwlgyahaj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWxzb2JldnVzcndsZ3lhaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjUyNTksImV4cCI6MjAzNzUwMTI1OX0.H8hlotvviqMWAhUs8nMju1s81uMbffzPYwHC_G-LJoM",
);

// DOM elements
const submitButton = document.getElementById("submit");
const ul = document.getElementById("dataList");
const sidebar = document.querySelector(".sidebar");
const newGroupButton = document.getElementById("New");
const loginButton = document.getElementById("LOGIN");
const chatArea = document.getElementById("chat-area");
const trash = document.getElementById("trashcan");

// State variables
let currentGroup = "home";
let isTexting = true;
let loggedInEmail = "";
let all_groups = []; // Array to store all groups
// Sign in with GitHub
const { data: userData, error: userError } =
  await supabaseClient.auth.getUser();
console.log("user is", await userData);
loggedInEmail = userData.user.email || "";
function removeBUTTON(id) {
  console.log(id);
  document.getElementById(id).remove();
}
// Initialize event listeners
function initEventListeners() {
  loginButton.addEventListener(
    "click",
    signInWithGithub,
    console.log("clicked"),
  );
  trash.addEventListener("click", async () => {
    const groupId = currentGroup; // Replace this with the actual value you want to match

    const { data, error } = await supabaseClient
      .from("messages")
      .delete()
      .eq("group", groupId); // Ensure 'group' is the column name and 'groupId' is the value to match

    if (error) {
      console.error("Error deleting message:", error);
    } else {
      console.log("Message deleted successfully");
    }
    removeBUTTON(currentGroup);
    console.log(currentGroup, all_groups);
  });

  newGroupButton.addEventListener("click", async () => {
    const groupName = prompt("Enter the group name");
    if (groupName === null || groupName.trim() === "") {
      alert("Group name cannot be empty");
      return;
    }

    if (all_groups.includes(groupName)) {
      alert("Group already exists");
      return;
    }

    // Create and add new group button only if group does not exist
    const newGroupButton = document.createElement("button");
    newGroupButton.textContent = groupName;
    newGroupButton.className = "group";
    newGroupButton.id = groupName;
    sidebar.appendChild(newGroupButton);
    all_groups.push(groupName);
    addGroupButtonEventListener(newGroupButton);
    console.log(all_groups);
  });
}

// Add event listener for sidebar group buttons
function addGroupButtonEventListener(button) {
  button.addEventListener("click", async () => {
    currentGroup = button.textContent;
  });
}

// Initialize groups in the sidebar
async function initGroups() {
  const groups = await fetchData();
  groups.forEach((group) => {
    if (!all_groups.includes(group.group)) {
      const groupButton = document.createElement("button");
      groupButton.textContent = group.group;
      groupButton.className = "group";
      groupButton.id = group.group;
      sidebar.appendChild(groupButton);
      addGroupButtonEventListener(groupButton);
      all_groups.push(group.group);
      console.log(all_groups);
    }
  });
}

// Fetch and display data in the list
async function updateDataList() {
  try {
    const data = await fetchData();
    ul.innerHTML = "";
    data
      .filter((item) => item.group.toLowerCase() === currentGroup.toLowerCase())
      .forEach((item) => addListItem(item.message, item.user));

    setTimeout(updateDataList, 200);
  } catch (error) {
    console.error("Error updating data list:", error.message);
  }
}

// Add a new list item to the data list
function addListItem(text, user) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `
    <li class="user">${user}</li>
    <li>${text}</li>
  `;
  ul.appendChild(div);
}

// Handle message submission
async function handleSubmit(event) {
  console.log("submit button clicked");
  console.log(loggedInEmail);
  if (isTexting && loggedInEmail) {
    event.preventDefault();
    const message = document.getElementById("message").value;
    await insertMessage("messages", message, loggedInEmail);
  } else {
    alert("You are not logged in or texting is disabled");
  }
}

// Insert a new message into the database
async function insertMessage(group, message, user) {
  try {
    const { error } = await supabaseClient
      .from(group)
      .insert({ message, user, group: currentGroup });

    if (error) throw error;
  } catch (error) {
    console.error("Error inserting message:", error.message);
  }
}

// Fetch data from the database
async function fetchData() {
  try {
    const { data, error } = await supabaseClient.from("messages").select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return [];
  }
}

async function signInWithGithub() {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "http://127.0.0.1:5500/src",
      },
    });

    if (error) throw error;

    // Retrieve user information
    if (userError) throw userError;

    loggedInEmail = userData.user.email || "";
    console.log("Logged in as:", loggedInEmail);
    document.getElementById("logedin").innerHTML = loggedInEmail;
  } catch (error) {
    console.error("Authentication error:", error.message);
  }
}

// Function to update the display based on the current group
function updateDisplay() {
  chatArea.style.display = isTexting ? "flex" : "none";
}
// Function to loop for periodic updates

function loop() {
  if (loggedInEmail !== "") {
    document.getElementById("logedin").innerHTML = userData.user.email;
  }
  updateDisplay();
  requestAnimationFrame(loop);
}

// Initialization function
async function init() {
  initEventListeners();
  console.log("INITING");
  await initGroups();
  loop();
  updateDataList();
  submitButton.addEventListener("click", handleSubmit);
}

// Execute initialization function
init();
